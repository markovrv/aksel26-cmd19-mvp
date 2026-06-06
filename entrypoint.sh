#!/bin/sh

echo "🚀 Запуск ПромОриентир..."

# Wait for any database initialization
sleep 2

echo "✅ Приложение запущено"
exec "$@"
