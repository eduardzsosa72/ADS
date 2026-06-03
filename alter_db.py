"""
Agrega la columna cliente_id a la tabla vehiculos si no existe,
y crea la FK hacia clientes(id).
Lee las credenciales del .env del proyecto.
"""
import os
import pymysql
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

conn = pymysql.connect(
    host=os.environ['DB_HOST'],
    port=int(os.environ['DB_PORT']),
    user=os.environ['DB_USER'],
    password=os.environ['DB_PASS'],
    database=os.environ['DB_NAME'],
)

with conn.cursor() as cur:
    # Verificar si la columna ya existe
    cur.execute("""
        SELECT COUNT(*) FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'vehiculos' AND COLUMN_NAME = 'cliente_id'
    """, (os.environ['DB_NAME'],))
    exists = cur.fetchone()[0]

    if exists:
        print("La columna cliente_id ya existe, nada que hacer.")
    else:
        cur.execute("ALTER TABLE vehiculos ADD COLUMN cliente_id INT NOT NULL DEFAULT 0 AFTER id")
        cur.execute("""
            ALTER TABLE vehiculos
            ADD CONSTRAINT fk_vehiculos_cliente
            FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
        """)
        conn.commit()
        print("Columna cliente_id y FK agregadas correctamente.")

    # Corregir fecha_creacion de VARCHAR(12) a DATE
    cur.execute("""
        SELECT DATA_TYPE FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'ordenes' AND COLUMN_NAME = 'fecha_creacion'
    """, (os.environ['DB_NAME'],))
    col_type = cur.fetchone()
    if col_type and col_type[0].lower() != 'date':
        cur.execute("ALTER TABLE ordenes MODIFY COLUMN fecha_creacion DATE NULL")
        conn.commit()
        print("Columna fecha_creacion corregida a DATE.")
    else:
        print("fecha_creacion ya es DATE, nada que hacer.")

conn.close()
