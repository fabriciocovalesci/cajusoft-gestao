import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

N8N_WEBHOOK_URL = "https://seu-n8n.com/webhook"  # Substitua pela URL do webhook do seu n8n

@csrf_exempt
def receive_webhook(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            response = requests.post(N8N_WEBHOOK_URL, json=data)

            return JsonResponse({"message": "Webhook recebido e enviado ao n8n", "status": response.status_code})
        except json.JSONDecodeError:
            return JsonResponse({"error": "Formato inválido"}, status=400)
    
    return JsonResponse({"error": "Método não permitido"}, status=405)
