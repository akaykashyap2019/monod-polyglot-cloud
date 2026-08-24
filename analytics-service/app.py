import os
import psycopg2
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_HOST = os.getenv("DB_HOST", "postgres-db")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "monod_user")
DB_PASS = os.getenv("DB_PASSWORD", "monod_password")
DB_NAME = os.getenv("DB_NAME", "monod_db")

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        dbname=DB_NAME
    )

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*), COALESCE(SUM(price), 0), COALESCE(AVG(price), 0) FROM orders;")
        count, total, avg = cur.fetchone()
        cur.close()
        conn.close()

        return jsonify({
            "status": "healthy",
            "engine": "Python 3.11 Flask Analytics",
            "total_orders": count,
            "total_revenue": round(float(total), 2),
            "average_ticket": round(float(avg), 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)