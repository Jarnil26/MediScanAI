"""
Views for user accounts
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from datetime import datetime

from .models import UserProfile
from .serializers import UserRegistrationSerializer, UserProfileSerializer, LoginSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """User registration endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken()
        refresh['user_id'] = str(user.id)
        refresh['email'] = user.email
        
        return Response({
            'message': 'User registered successfully',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint"""
    print("🔍 Incoming Login Request Data:", request.data)

    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.validated_data['user']

        # Update last login timestamp
        user.last_login = datetime.utcnow()
        user.save()

        # Generate JWT tokens
        refresh = RefreshToken()
        refresh['user_id'] = str(user.id)
        refresh['email'] = user.email

        print("✅ Login successful for:", user.email)

        return Response({
            'message': 'Login successful',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)

    # ❌ Invalid credentials or invalid input
    print("❌ Serializer validation failed:", serializer.errors)
    return Response({
        "error": "Login failed",
        "details": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
def logout_view(request):
    """User logout endpoint"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Get current user profile"""
        user_id = self.request.user.id if hasattr(self.request.user, 'id') else None
        if user_id:
            return UserProfile.objects(id=user_id).first()
        return None
    
    def get(self, request, *args, **kwargs):
        """Get user profile"""
        # For JWT authentication, extract user from token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            try:
                from rest_framework_simplejwt.tokens import UntypedToken
                from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
                import jwt
                from django.conf import settings
                
                token = auth_header.split(' ')[1]
                try:
                    UntypedToken(token)
                    decoded = jwt.decode(token, options={"verify_signature": False})
                    user_id = decoded.get('user_id')
                    user = UserProfile.objects(id=user_id).first()
                    
                    if user:
                        serializer = self.get_serializer(user)
                        return Response(serializer.data)
                except (InvalidToken, TokenError):
                    pass
            except Exception:
                pass
        
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({'status': 'healthy', 'service': 'Medical AI Platform'})
