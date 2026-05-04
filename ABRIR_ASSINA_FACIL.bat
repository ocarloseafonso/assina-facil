@echo off
title Sistema Assina Fácil - Servidor
echo ==========================================
echo    INICIANDO ASSINA FACIL
echo ==========================================
echo.
echo [1/2] Verificando dependencias e iniciando servidor...
cd /d "%~dp0"
start "SERVIDOR ASSINA FACIL" cmd /k "npm install && npm run dev"

echo.
echo [2/2] Aguardando o servidor carregar (10 segundos)...
timeout /t 10 /nobreak > nul

echo.
echo [OK] Abrindo o painel no navegador...
start "" "http://localhost:3001"

echo.
echo ==========================================
echo    PRONTO! O SISTEMA ESTA RODANDO.
echo    Mantenha a janela preta aberta.
echo ==========================================
pause
