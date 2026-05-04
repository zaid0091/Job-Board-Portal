from django.db import migrations


def add_search_vector_field(apps, schema_editor):
    """Add search_vector column — only meaningful for PostgreSQL."""
    if schema_editor.connection.vendor != 'postgresql':
        return

    from django.contrib.postgres.search import SearchVectorField
    Job = apps.get_model('jobs', 'Job')
    # Django's migration system handles the column creation via AddField.
    # This function ensures the trigger is set up after the column exists.
    pass


def setup_postgres_search(apps, schema_editor):
    """Set up PostgreSQL full-text search triggers and backfill."""
    if schema_editor.connection.vendor != 'postgresql':
        return

    with schema_editor.connection.cursor() as cursor:
        # Enable pg_trgm extension for fuzzy matching
        cursor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

        # Create trigger function
        cursor.execute("""
            CREATE OR REPLACE FUNCTION jobs_job_search_vector_update()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(NEW.requirements, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(NEW.responsibilities, '')), 'C') ||
                    setweight(to_tsvector('english', coalesce(NEW.benefits, '')), 'C') ||
                    setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C');
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)

        # Attach trigger
        cursor.execute("""
            DROP TRIGGER IF EXISTS jobs_job_search_vector_trigger ON jobs_job;
            CREATE TRIGGER jobs_job_search_vector_trigger
                BEFORE INSERT OR UPDATE ON jobs_job
                FOR EACH ROW
                EXECUTE FUNCTION jobs_job_search_vector_update();
        """)

        # Backfill existing rows — trigger won't fire on raw SQL UPDATE
        cursor.execute("""
            UPDATE jobs_job SET search_vector =
                setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
                setweight(to_tsvector('english', coalesce(requirements, '')), 'B') ||
                setweight(to_tsvector('english', coalesce(responsibilities, '')), 'C') ||
                setweight(to_tsvector('english', coalesce(benefits, '')), 'C') ||
                setweight(to_tsvector('english', coalesce(location, '')), 'C')
            WHERE search_vector IS NULL;
        """)


def teardown_postgres_search(apps, schema_editor):
    """Remove PostgreSQL search triggers."""
    if schema_editor.connection.vendor != 'postgresql':
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DROP TRIGGER IF EXISTS jobs_job_search_vector_trigger ON jobs_job;")
        cursor.execute("DROP FUNCTION IF EXISTS jobs_job_search_vector_update();")
        cursor.execute("DROP EXTENSION IF EXISTS pg_trgm CASCADE;")


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0003_initial'),
    ]

    operations = [
        # Add the search_vector column (works for both PostgreSQL and SQLite)
        migrations.AddField(
            model_name='job',
            name='search_vector',
            field=__import__('django.contrib.postgres.search', fromlist=['SearchVectorField']).SearchVectorField(
                editable=False,
                null=True,
                help_text='PostgreSQL full-text search vector (auto-populated by triggers).',
            ),
        ),

        # Set up PostgreSQL-specific search infrastructure
        migrations.RunPython(
            code=setup_postgres_search,
            reverse_code=teardown_postgres_search,
        ),
    ]
