from django.contrib import admin
from django.urls import path, include
from users.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import UserInfoView

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),
    
    # User Info/Authentication and Token Management
    path('api/user/register/', CreateUserView.as_view(), name="register"),
    path('api/token/', TokenObtainPairView.as_view(), name="get_token"),
    path('api/token/refresh/', TokenRefreshView.as_view(), name="refresh"),
    path('api/user_info', UserInfoView.as_view(), name='user_info'),

    
    # REST Framework's Browsable API Authentication
    path('api-auth/', include('rest_framework.urls')),
    
    # Workspace Management
    path('api/', include('workspace.urls')),  # All workspace-related endpoints
]
