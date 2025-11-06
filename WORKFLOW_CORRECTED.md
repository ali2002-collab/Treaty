# Corrected Workflow - Party Detection Feature

## ✅ Correct Workflow Order

The workflow has been corrected to follow this exact sequence:

### 1. **Upload Contract**
- User uploads DOCX file
- File is processed and stored
- Text is extracted

### 2. **AI Detects Contract Type** ✨ (NOW USING AI)
- **NEW**: Uses AI (Gemini) to analyze contract text
- Detects contract type from comprehensive list
- Updates `contracts.detected_type` in database
- Shows loading state: "Detecting Contract Type"

### 3. **AI Detects Parties** ✨
- AI analyzes contract text to identify all parties
- Extracts party names, roles, and descriptions
- Shows loading state: "Detecting Contract Parties"

### 4. **User Selects Party** ✨
- User sees list of detected parties
- User selects which party they represent
- Selection saved to `contracts.user_selected_party`
- User can skip if no parties detected

### 5. **Analysis (Based on Selection)** ✨
- AI analyzes contract **from the selected party's perspective**
- Risks are risks TO the selected party
- Opportunities are opportunities FOR the selected party
- Negotiation points are suggestions FOR the selected party
- Risk score reflects favorability FOR the selected party
- All data stored in `analyses` table with `parties` JSONB

## Code Changes Made

### ✅ New Function: `detect-contract-type.ts`
- Uses AI (Gemini) to detect contract type
- Analyzes contract text (not just filename)
- Returns type, confidence, and reasoning
- Updates `contracts.detected_type` automatically

### ✅ Updated: `new-contract-dialog.tsx`
- Workflow steps corrected:
  - `upload` → `detecting-type` → `detecting-parties` → `select-party` → `confirm` → `analyzing` → `success`
- Removed filename-based type detection
- Now uses AI for type detection
- Better UI states for each step

### ✅ Updated: `analyze-with-gemini.ts`
- Gets user's selected party before analysis
- Adds party-specific context to AI prompt
- Analysis is personalized based on selected party
- Risks, opportunities, and recommendations are party-specific

## Database Structure

### Tables Used:
- `contracts.user_selected_party` (TEXT) - User's selected party
- `contracts.detected_type` (TEXT) - AI-detected contract type
- `analyses.parties` (JSONB) - Stores detected parties + user selection

### Data Flow:
```
Upload → contracts table created
  ↓
AI Type Detection → contracts.detected_type updated
  ↓
AI Party Detection → parties detected (in memory)
  ↓
User Selection → contracts.user_selected_party saved
  ↓
Analysis → analyses.parties JSONB stores everything
```

## How Analysis Uses Selected Party

When analysis runs, the AI prompt includes:

```
IMPORTANT: The user represents the party "[Selected Party]" in this contract.
- Focus on how contract terms affect "[Selected Party]" specifically
- Risks should be risks TO "[Selected Party]"
- Opportunities should be opportunities FOR "[Selected Party]"
- Negotiation points should be suggestions for "[Selected Party]"
- Risk score should reflect favorability FOR "[Selected Party]"
```

This ensures:
- ✅ Personalized risk assessment
- ✅ Party-specific opportunities
- ✅ Relevant negotiation suggestions
- ✅ Accurate risk scoring from user's perspective

## Verification Checklist

✅ Upload contract works  
✅ AI detects contract type (not filename-based)  
✅ AI detects parties from contract text  
✅ User can select which party they represent  
✅ User selection is saved to database  
✅ Analysis uses selected party for personalization  
✅ All data properly linked through existing tables  
✅ No separate tables needed - uses existing structure  

## Testing the Workflow

1. Upload a contract
2. Watch for "Detecting Contract Type" (AI working)
3. Watch for "Detecting Contract Parties" (AI working)
4. Select your party from the list
5. Click "Analyze Contract"
6. Verify analysis is personalized to your selected party

The workflow is now correct and fully integrated! 🎉

