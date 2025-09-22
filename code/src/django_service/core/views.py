from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import AMLRequest
from .serializers import AMLRequestSerializer
from .workflow import invoke_agent


@api_view(['GET'])
def compute_risk_score(request):
    # For GET requests use query params; support body if provided
    wallet_address = request.query_params.get('wallet_address') or request.data.get('wallet_address')
    if not wallet_address:
        return Response({"error": "Wallet address is required."}, status=status.HTTP_400_BAD_REQUEST)
    


    risk_score, failed_checks = invoke_agent(wallet_address)

    # Ensure the saved risk_score is an integer and overwrite existing value
    obj, created = AMLRequest.objects.update_or_create(
        wallet_address=wallet_address,
        defaults={'risk_score': int(risk_score)},
    )

    serializer = AMLRequestSerializer(obj)
    data = serializer.data
    data['failed_checks'] = failed_checks
    return Response(data, status=status.HTTP_200_OK)
    