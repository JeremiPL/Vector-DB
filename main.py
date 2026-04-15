from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI 
import numpy as np 
from chromadb.utils import embedding_functions

app = FastAPI()

embedder = embedding_functions.DefaultEmbeddingFunction()


def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
	dot_product = float(np.dot(vec1, vec2))
	norm1 = float(np.linalg.norm(vec1))
	norm2 = float(np.linalg.norm(vec2))

	if norm1 == 0 or norm2 == 0:
		return 0.0

	return dot_product / (norm1 * norm2)

@app.get("/vector")
def get_vector(text: str):
	vector = embedder([text])[0]
	return [float(value) for value in vector]

@app.get("/similarity")
def get_similarity(text1: str, text2: str):
	vectors = embedder([text1, text2])
	vec1 = [float(value) for value in vectors[0]]
	vec2 = [float(value) for value in vectors[1]]
	return {"similarity": cosine_similarity(vec1, vec2)}



app.mount("/", StaticFiles(directory="static", html=True), name="static")