from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
import re

app = FastAPI()

# Enable CORS for React frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummarizeRequest(BaseModel):
    youtubeUrl: str

def get_video_id(url: str) -> str:
    match = re.search(r"(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})", url)
    if match:
        return match.group(1)
    else:
        raise ValueError("Invalid YouTube URL")

# Load summarization model once at startup
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

@app.post("/api/summarize")
async def summarize_video(request: SummarizeRequest):
    try:
        video_id = get_video_id(request.youtubeUrl)
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        full_text = " ".join([t['text'] for t in transcript_list])

        summary_output = summarizer(full_text, max_length=150, min_length=40, do_sample=False)
        summary_text = summary_output[0]['summary_text']

        return {"summary": summary_text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
