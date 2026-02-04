@echo off
echo Starting local server for presentation...
echo.
echo Open your browser at: http://localhost:8000
echo Press Ctrl+C to stop the server.
echo.
python -m http.server 8000
pause
