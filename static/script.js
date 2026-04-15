const form = document.getElementById("embedForm");
const textInput = document.getElementById("textInput");
const statusEl = document.getElementById("status");
const dimensionEl = document.getElementById("dimension");
const vectorOutput = document.getElementById("vectorOutput");
const similarityForm = document.getElementById("similarityForm");
const text1Input = document.getElementById("text1Input");
const text2Input = document.getElementById("text2Input");
const similarityStatus = document.getElementById("similarityStatus");
const similarityResult = document.getElementById("similarityResult");
const TARGET_DIMENSION = 314;

function fitTo314(vector) {
	if (vector.length >= TARGET_DIMENSION) {
		return vector.slice(0, TARGET_DIMENSION);
	}

	return [...vector, ...new Array(TARGET_DIMENSION - vector.length).fill(0)];
}

function parseEmbedding(payload) {
	if (Array.isArray(payload)) {
		return payload;
	}

	if (payload && Array.isArray(payload.embedding)) {
		return payload.embedding;
	}

	if (payload && Array.isArray(payload.vector)) {
		return payload.vector;
	}

	return null;
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const text = textInput.value.trim();
	if (!text) {
		statusEl.textContent = "Please enter a word first.";
		return;
	}

	statusEl.textContent = "Embedding...";
	dimensionEl.textContent = "Dimension: -";
	vectorOutput.value = "";

	try {
		const response = await fetch(`/vector?text=${encodeURIComponent(text)}`);
		const rawBody = await response.text();
		let data = null;

		try {
			data = rawBody ? JSON.parse(rawBody) : null;
		} catch {
			data = null;
		}

		if (!response.ok) {
			const detail =
				(data && (data.detail || data.error || data.message)) ||
				rawBody ||
				`Request failed with status ${response.status}`;
			throw new Error(String(detail));
		}

		const parsed = parseEmbedding(data);
		if (!parsed) {
			throw new Error("API returned JSON, but no embedding array was found.");
		}

		const vector314 = fitTo314(parsed.map(Number));
		dimensionEl.textContent = `Dimension: ${vector314.length}`;
		vectorOutput.value = JSON.stringify(vector314, null, 2);
		statusEl.textContent = "Done.";
	} catch (error) {
		statusEl.textContent = `Error: ${error.message}`;
		vectorOutput.value = "Could not fetch embedding. Check API/server output for details.";
	}
});

similarityForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const text1 = text1Input.value.trim();
	const text2 = text2Input.value.trim();

	if (!text1 || !text2) {
		similarityStatus.textContent = "Please enter both texts.";
		return;
	}

	similarityStatus.textContent = "Comparing...";
	similarityResult.textContent = "Similarity: -";

	try {
		const response = await fetch(
			`/similarity?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`
		);
		const rawBody = await response.text();
		let data = null;

		try {
			data = rawBody ? JSON.parse(rawBody) : null;
		} catch {
			data = null;
		}

		if (!response.ok) {
			const detail =
				(data && (data.detail || data.error || data.message)) ||
				rawBody ||
				`Request failed with status ${response.status}`;
			throw new Error(String(detail));
		}

		if (!data || typeof data.similarity !== "number") {
			throw new Error("API response did not include a numeric similarity value.");
		}

		similarityResult.textContent = `Similarity: ${data.similarity.toFixed(4)}`;
		similarityStatus.textContent = "Done.";
	} catch (error) {
		similarityStatus.textContent = `Error: ${error.message}`;
	}
});
