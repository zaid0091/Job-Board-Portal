class ReadWriteSerializerMixin:
    """
    Mixin that uses different serializers for read and write operations.

    Set `read_serializer_class` and `write_serializer_class` on the view.
    """

    def get_serializer_class(self):
        if self.request.method in ('POST', 'PUT', 'PATCH'):
            return getattr(self, 'write_serializer_class', self.serializer_class)
        return getattr(self, 'read_serializer_class', self.serializer_class)
