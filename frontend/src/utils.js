export async function summarizeText(text) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      throw new Error("Summarization API failed");
    }

    const result = await response.json();
    return result[0]?.summary_text || "Could not generate summary";
  } catch (error) {
    console.error(error);
    return "❌ Failed to fetch summary";
  }
}
