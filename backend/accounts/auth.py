from rest_framework_simplejwt.authentication import JWTAuthentication
from bson import ObjectId
from accounts.models import UserProfile
from mongoengine.errors import DoesNotExist

class MongoEngineJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")

        if not user_id:
            return None

        try:
            return UserProfile.objects.get(id=ObjectId(user_id))
        except DoesNotExist:
            return None
        except Exception:
            return None
    