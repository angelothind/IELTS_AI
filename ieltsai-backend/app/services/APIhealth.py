from openai import OpenAI


def check_deepseek_connection(API_KEY):
    client = OpenAI(api_key= API_KEY, base_url="https://api.deepseek.com")
    messages = [{"role": "user", "content": "I am checking if I can interact with you through my API and API key. Can you confirm this is working?"}]
    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        messages=messages
    )
    return{response.choices[0].message.content}


