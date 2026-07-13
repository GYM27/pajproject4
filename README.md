# 🚀 Gestão de Leads - Full-Stack App (React & Jakarta EE)

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java)
![Jakarta EE](https://img.shields.io/badge/Jakarta_EE-10-blue?style=for-the-badge&logo=eclipse)
![Hibernate](https://img.shields.io/badge/Hibernate-ORM-yellow?style=for-the-badge&logo=hibernate)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-42.7-336791?style=for-the-badge&logo=postgresql)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-brown?style=for-the-badge)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=for-the-badge&logo=bootstrap)

## 📖 Sobre o Projeto

Este projeto consiste numa aplicação *Full-Stack* desenvolvida no âmbito da cadeira de **Programação Avançada em Java (2026)** do programa **Acertar o Rumo** da Faculdade de Ciências e Tecnologia da Universidade de Coimbra (FCTUC). 

O objetivo principal deste projeto foi evoluir uma aplicação web existente, migrando o **Frontend** de *Vanilla JavaScript* para **React.js**, incorporando as melhores práticas de desenvolvimento SPA (Single Page Application) e gestão de estado avançada. O **Backend** mantém-se robusto, assente numa arquitetura corporativa utilizando a stack **Jakarta EE** e base de dados **PostgreSQL**.

---

## 🏗️ Arquitetura do Sistema

A solução adota uma arquitetura *Client-Server* separada, promovendo um forte desacoplamento entre a interface do utilizador e a lógica de negócio:

- **Backend (API REST):** Desenvolvido com **Java 21** e **Jakarta EE 10**. Expõe endpoints RESTful (JAX-RS) para a gestão de recursos (utilizadores, leads, tarefas, etc.). A persistência de dados é garantida através do **Hibernate ORM (JPA)** conectado a um motor **PostgreSQL**. A lógica de negócio assegura a integridade transacional e a filtragem otimizada de dados diretamente na base de dados.
- **Frontend (SPA React):** Desenvolvido com **React 19** e construído via **Vite**. A interface comunica assincronamente com a REST API em formato JSON. O estado global da aplicação é gerido eficientemente pelo **Zustand**, permitindo uma arquitetura limpa com *stores* bem definidas. O design é suportado por **React-Bootstrap**.

---

## 💻 Tecnologias Utilizadas

### ⚙️ Backend
- **Linguagem:** Java 21
- **Framework Principal:** Jakarta EE 10 (JAX-RS, CDI)
- **Persistência de Dados:** JPA / Hibernate ORM (6.6)
- **Base de Dados:** PostgreSQL (JDBC Driver 42.7)
- **Validação:** Hibernate Validator
- **Testing:** JUnit 5, Mockito, Hamcrest
- **Build Tool:** Maven

### 🎨 Frontend
- **Biblioteca Principal:** React.js 19
- **Build Tool:** Vite 8
- **Gestão de Estado Global:** Zustand 5
- **Routing:** React Router DOM v7
- **Styling / UI Components:** Bootstrap 5 & React-Bootstrap
- **Linting:** ESLint

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Java JDK 21** instalado.
- **Node.js** (v18 ou superior) e **npm**.
- Servidor **PostgreSQL** a correr localmente.
- **Maven** (opcional, o projeto inclui o Maven Wrapper).

### Configurar e Correr o Backend
1. Navegue para o diretório do backend:
   ```bash
   cd Backend
   ```
2. Configure as credenciais da base de dados PostgreSQL no ficheiro `persistence.xml` (localizado tipicamente em `src/main/resources/META-INF/`).
3. Compile e construa o projeto (ficheiro `.war`):
   ```bash
   ./mvnw clean install
   ```
4. Faça o *deploy* do artefato gerado (na pasta `/target`) num servidor aplicacional compatível com Jakarta EE 10 (ex: WildFly, Payara ou Tomcat).

### Configurar e Correr o Frontend
1. Navegue para o diretório do frontend:
   ```bash
   cd Frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento Vite:
   ```bash
   npm run dev
   ```
4. A aplicação estará disponível no browser (normalmente em `http://localhost:5173`).

---

## 👨‍💻 Contexto Académico

**Trabalho Prático 4 (TP4)**
- **Instituição:** Universidade de Coimbra - Faculdade de Ciências e Tecnologia (FCTUC)
- **Curso:** Acertar o Rumo
- **Disciplina:** Programação Avançada em Java (2026)

> *"A adaptação para React.js e Zustand permitiu criar uma interface muito mais fluida, escalável e com uma gestão de dados incrivelmente eficiente face à abordagem tradicional em Vanilla JS."*
