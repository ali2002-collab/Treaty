"use server"

import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
// PDF parsing temporarily disabled - will implement later
import * as mammoth from 'mammoth'
import { randomUUID } from 'crypto'

export async function uploadAndProcessContract(formData: FormData) {
  try {
    // Get current user session
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Unauthorized')
    }

    const userId = session.user.id
    const file = formData.get('file') as File

    if (!file) {
      throw new Error('File is required')
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF and DOCX files are supported')
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB')
    }

    // Check if file is empty
    if (file.size === 0) {
      throw new Error('File cannot be empty')
    }

    // Get or create default project for user
    let { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    let projectId: string
    if (!projects || projects.length === 0) {
      // Create default project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: 'My Project',
          user_id: userId
        })
        .select('id')
        .single()

      if (projectError || !newProject) {
        throw new Error('Failed to create default project')
      }
      projectId = newProject.id
    } else {
      projectId = projects[0].id
    }

    // Generate unique ID and file path
    const contractId = randomUUID()
    const fileExtension = file.type === 'application/pdf' ? 'pdf' : 'docx'
    const storagePath = `contracts/${userId}/${contractId}.${fileExtension}`

    // Create service role client for admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file to Supabase Storage
    const { error: uploadError } = await serviceClient.storage
      .from('contracts')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error('Failed to upload file to storage')
    }

    // Insert contract metadata into database
    const { error: insertError } = await supabase
      .from('contracts')
      .insert({
        id: contractId,
        project_id: projectId, // Use the projectId obtained
        filename: file.name,
        mime: file.type, // Changed from mime_type to mime
        size: file.size,
        storage_path: storagePath,
        user_id: userId,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      // Clean up uploaded file if database insert fails
      await serviceClient.storage.from('contracts').remove([storagePath])
      throw new Error('Failed to save contract metadata')
    }

    // Download file for parsing
    const { data: fileData, error: downloadError } = await serviceClient.storage
      .from('contracts')
      .download(storagePath)

    if (downloadError || !fileData) {
      throw new Error('Failed to download file for parsing')
    }

    // Validate file data
    if (typeof fileData.arrayBuffer !== 'function') {
      throw new Error('Invalid file data format for parsing')
    }

    console.log('File data for parsing:', {
      type: typeof fileData,
      hasArrayBuffer: typeof fileData.arrayBuffer === 'function',
      fileType: file.type
    })

    // Parse file content
    let extractedText = ''
    let pages = 1

    if (file.type === 'application/pdf') {
      try {
        console.log('PDF file detected - storing without parsing for now')
        // TODO: Implement PDF parsing later
        extractedText = '[PDF content will be parsed later]'
        pages = 1
      } catch (parseError) {
        console.error('PDF handling error:', parseError)
        // For now, continue with placeholder text
        extractedText = '[PDF content will be parsed later]'
        pages = 1
      }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        console.log('Parsing DOCX file...')
        const docxBuffer = Buffer.from(await fileData.arrayBuffer())
        console.log('DOCX buffer created, length:', docxBuffer.length)
        const result = await mammoth.extractRawText({ buffer: docxBuffer })
        extractedText = result.value
        pages = Math.ceil(extractedText.length / 2000) // Rough estimate for DOCX
        console.log('DOCX parsed successfully, text length:', extractedText.length)
      } catch (parseError) {
        console.error('DOCX parsing error:', parseError)
        throw new Error('Failed to parse DOCX file. The file may be corrupted.')
      }
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the file. The file may be image-only or corrupted.')
    }

    // Insert extraction into database
    const { error: extractionError } = await supabase
      .from('extractions')
      .insert({
        contract_id: contractId,
        text: extractedText,
        pages: pages,
        created_at: new Date().toISOString()
      })

    if (extractionError) {
      console.error('Extraction insert error:', extractionError)
      throw new Error('Failed to save extracted text')
    }

    return { 
      success: true, 
      contractId,
      pages 
    }

  } catch (error) {
    console.error('Upload and process error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

 