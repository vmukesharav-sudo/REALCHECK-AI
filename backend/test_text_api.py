import requests

BASE_URL = "http://localhost:8000/api"

text_ai = "Furthermore, it is crucial to delve into this multifaceted issue. In conclusion, this is a testament to the fact that we must revolutionize the landscape."
text_human = "I was honestly pretty skeptical when we kicked off the project back in November. We ran into weird edge cases with the database, and half the scripts broke! But hey, after three late-night debug marathons, the pipeline stabilized. What a crazy ride."

texts = [
    ("AI-like", text_ai),
    ("Human-like", text_human)
]

for label, text in texts:
    print(f"\n{'='*50}\nTesting {label} Text")
    response = requests.post(f"{BASE_URL}/analyze/text", data={"text": text})
    if response.status_code == 200:
        res = response.json()
        print(f"Assessment: {res.get('assessment')}")
        print(f"Authenticity Score: {res.get('authenticity_score')}")
        print(f"AI Generation Probability: {res.get('ai_generation_probability')}")
        print("Metrics:")
        print(res.get("text_metrics"))
        print("\nSignals:")
        for signal in res.get("signals", []):
            print(f"  - {signal['name']} ({signal['status']}): {signal['explanation']}")
    else:
        print(f"Error: {response.text}")
