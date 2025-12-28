# 🛡️ Env-Guard

Env-Guard é uma ferramenta leve para **validar e comparar arquivos `.env`** utilizando **schemas predefinidos ou customizados**.

O objetivo é identificar rapidamente problemas comuns de configuração, como:
- variáveis ausentes
- valores inválidos
- variáveis extras inesperadas
- diferenças reais entre ambientes (ex: dev vs prod)

Projeto desenvolvido com **FastAPI**, **Python puro** e **Docker**.

---

## 🚀 Funcionalidades

- ✅ Validação de arquivos `.env`
- 🔍 Comparação semântica entre dois `.env`
- 📦 Schemas prontos:
  - Generic
  - Flask
  - FastAPI
  - Django
  - Node.js
- 🧩 Suporte a schema customizado (upload `.yaml`)
- 🧪 Testes automatizados com Pytest
- 🐳 Aplicação dockerizada
- 🌐 Interface web simples com Bootstrap

---

## 📂 Estrutura do Projeto

```
env-guard/
├── backend/
│   └── app/
│       ├── main.py
│       ├── core/
│       └── schemas/
├── frontend/
│   ├── static/
│   └── *.html
├── Dockerfile
└── README.md
```

---

## 🔎 Validação de `.env`

Permite validar um arquivo `.env` com base em um schema selecionado.

Exemplo de resposta:

```json
{
  "missing": ["DATABASE_URL"],
  "invalid": [
    { "key": "PORT", "reason": "Value < min (1024)" }
  ],
  "extra": ["FOO"],
  "validated": {
    "DEBUG": true
  }
}
```

---

## 🔄 Comparação entre Ambientes

Compara dois arquivos `.env` (ex: desenvolvimento e produção) usando o mesmo schema.

Detecta:
- variáveis presentes apenas em um dos arquivos
- variáveis com valores diferentes
- resultado da validação de cada ambiente

---

## 🧪 Executar Testes

```bash
pytest
```

---

## 🐳 Executar com Docker

### Build da imagem
```bash
docker build -t env-guard .
```

### Rodar container
```bash
docker run -p 8000:8000 env-guard
```

Acessos:
- Interface Web: http://localhost:8000
- Documentação da API: http://localhost:8000/docs

---

## 🛠️ Tecnologias Utilizadas

- Python 3.11
- FastAPI
- Starlette
- PyYAML
- Pytest
- Docker
- Bootstrap

---

## 🎯 Casos de Uso

- Prevenir erros de configuração de ambiente
- Comparar ambientes (dev, staging, prod)
- Validação em pipelines CI/CD
- Onboarding de novos desenvolvedores
- Auditoria de configurações

---

## 📌 Autor

Gabriel Rubiali  
📧 gabrielrubiali@gmail.com  
🔗 https://github.com/rubiali