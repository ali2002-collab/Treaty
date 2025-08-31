# Authentication Logging Configuration

This project now includes a controlled logging system for authentication events. You can configure what gets logged to the console based on your needs.

## Configuration

Add this environment variable to your `.env.local` file:

```bash
# Authentication Logging Configuration
# Set this to control what gets logged to the console
# Options: debug, info, warn, error, none
NEXT_PUBLIC_LOG_LEVEL=debug
```

## Log Levels

- **`debug`**: Show all logs (recommended for development)
- **`info`**: Show info, warn, and error logs
- **`warn`**: Show only warn and error logs  
- **`error`**: Show only error logs
- **`none`**: Disable all console logs (recommended for production)

## Default Behavior

- **Development**: `debug` level (shows everything)
- **Production**: `warn` level (shows only warnings and errors)

## What Gets Logged

### Info Level (default for production)
- Authentication state changes (SIGNED_IN, SIGNED_OUT, etc.)
- Session expiration messages
- General auth information

### Debug Level (development)
- All of the above plus:
- Detailed error information
- Session refresh details
- Periodic auth checks

### Warn Level
- Authentication errors
- Token refresh failures
- Session validation issues

### Error Level
- Critical authentication failures
- Sign-out errors
- Middleware auth errors

## Example Output

With `NEXT_PUBLIC_LOG_LEVEL=info`:
```
[AUTH] SIGNED_IN - User: f10e62e9...
[AUTH] TOKEN_REFRESHED
[AUTH] SIGNED_OUT
```

With `NEXT_PUBLIC_LOG_LEVEL=warn`:
```
[WARN] Token refresh failed: Invalid refresh token
[ERROR] Middleware auth error: JWT expired
```

## Security Benefits

- **User ID masking**: User IDs are truncated in logs (only first 8 characters shown)
- **Environment control**: Different logging levels for different environments
- **No sensitive data**: Passwords and tokens are never logged

## Migration Notes

All existing `console.log`, `console.error`, etc. calls in authentication code have been replaced with the new logger system. The functionality remains the same, but now you have full control over what gets displayed. 