from rest_framework import permissions


class IsEmployer(permissions.BasePermission):
    """Allows access only to users with the EMPLOYER role."""
    message = 'Only employers can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'EMPLOYER'
        )


class IsSeeker(permissions.BasePermission):
    """Allows access only to users with the SEEKER role."""
    message = 'Only job seekers can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'SEEKER'
        )


class IsAdmin(permissions.BasePermission):
    """Allows access only to admin users."""
    message = 'Only administrators can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )


class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow the owner
    of an object to access/modify it.
    """
    message = 'You do not have permission to access this resource.'

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'employer'):
            return obj.employer.user == request.user
        if hasattr(obj, 'applicant'):
            return obj.applicant == request.user
        return False


class IsJobOwner(permissions.BasePermission):
    """Only the employer who created the job can modify it."""
    message = 'You can only modify your own job listings.'

    def has_object_permission(self, request, view, obj):
        return obj.employer.user == request.user


class IsApplicationOwner(permissions.BasePermission):
    """
    Seekers can view their own applications.
    Employers can view applications for their jobs.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role == 'SEEKER':
            return obj.applicant == user

        if user.role == 'EMPLOYER':
            return obj.job.employer.user == user

        if user.role == 'ADMIN':
            return True

        return False


class ReadOnly(permissions.BasePermission):
    """Allow read-only access for any request."""

    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS
