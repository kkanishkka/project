# Flashcard AI Generation Setup

## How Flashcard Generation Works

The flashcard generation system uses a **two-tier approach**:

### 1. **Primary: Hugging Face API** (Recommended)
- Uses the Hugging Face Inference API with the `google/flan-t5-small` model
- Generates intelligent, context-aware flashcards from your notes
- Requires a Hugging Face API key

### 2. **Fallback: Local Heuristic Generation** (Automatic)
- If Hugging Face API fails or API key is missing, the system automatically uses a local fallback
- Uses text processing to split content into sentences and generate basic flashcards
- Works without any API key, but generates simpler flashcards

## Setup Instructions

### Option 1: Using Hugging Face API (Recommended)

1. **Get a Hugging Face API Key:**
   - Go to https://huggingface.co/
   - Sign up or log in
   - Go to your profile → Settings → Access Tokens
   - Create a new token with "Read" permissions
   - Copy the token

2. **Add to Environment Variables:**
   - Create or edit `.env` file in `project/backend/` directory
   - Add the following variables:
   ```env
   HUGGINGFACE_API_KEY=your_token_here
   AI_PROVIDER=huggingface
   FLASHCARDS_PER_NOTE=8
   ```

3. **Restart your backend server**

### Option 2: Use Local Fallback Only (No API Key Needed)

1. **Add to Environment Variables:**
   - Create or edit `.env` file in `project/backend/` directory
   - Add the following:
   ```env
   AI_PROVIDER=local
   FLASHCARDS_PER_NOTE=8
   ```

2. **Restart your backend server**

## How It Works Without API Key

If you don't set `HUGGINGFACE_API_KEY` or if the API fails:

1. The system catches the error
2. Automatically switches to `localFallback()` function
3. The fallback function:
   - Splits your note content into sentences
   - Creates questions from key sentences
   - Generates basic flashcards with question-answer pairs
   - Uses the note title for context

**Example:**
- If your note has: "JavaScript is a programming language. It is used for web development."
- The fallback will create flashcards like:
  - Q: "What is the key point about 'JavaScript' in [Note Title]?"
  - A: "JavaScript is a programming language. It is used for web development."

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `HUGGINGFACE_API_KEY` | Your Hugging Face API token | None | No (uses fallback if missing) |
| `AI_PROVIDER` | Provider to use: `huggingface` or `local` | `huggingface` | No |
| `FLASHCARDS_PER_NOTE` | Number of flashcards to generate per note | `8` | No |

## File Location

- **Backend `.env` file:** `project/backend/.env`
- **Service file:** `project/backend/src/services/ai.service.js`

## Testing

1. **Test with API Key:**
   - Create a note with content
   - Check server logs for API calls
   - Verify flashcards are generated

2. **Test without API Key:**
   - Remove or comment out `HUGGINGFACE_API_KEY` in `.env`
   - Create a note with content
   - Check that flashcards are still generated (using fallback)
   - Check server logs for "AI generation failed, using fallback" message

## Troubleshooting

### Flashcards not generating?
1. Check server logs for errors
2. Verify `.env` file is in `project/backend/` directory
3. Ensure `.env` file is loaded (check server startup logs)
4. Check if content is at least 10 characters long

### API errors?
1. Verify your Hugging Face API key is correct
2. Check your Hugging Face account has API access
3. Check your internet connection
4. System will automatically fallback to local generation

### Poor quality flashcards?
1. If using fallback, consider getting a Hugging Face API key for better results
2. Ensure your note content is detailed and well-structured
3. Increase `FLASHCARDS_PER_NOTE` if you want more flashcards

## Notes

- The system is designed to **always generate flashcards**, even if the API fails
- The fallback ensures your app continues working without external dependencies
- Hugging Face API provides better, more intelligent flashcards
- Local fallback provides basic, functional flashcards

