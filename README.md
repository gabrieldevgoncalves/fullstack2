J-Tech Tasklist — Monorepo (Frontend + Backend)

Aplicação full-stack de lista de tarefas.
Frontend em Next.js + TypeScript + Zustand e backend em Spring Boot + JPA + MySQL.

Sumário

Arquitetura

Requisitos

Configuração do Backend (Java/Spring Boot)

Banco de Dados (MySQL)

Arquivo application.yml

Seed: usuário Joao/123

Executar o backend

Swagger/OpenAPI

Erros comuns (e soluções)

Configuração do Frontend (Next.js)

Variáveis de ambiente

Executar o frontend

Login por username/senha

Contrato da API (resumo prático)

Checklist de verificação rápida

Licença

Arquitetura
backend/           # Spring Boot (Java 22), JPA, Security, Swagger
frontend/          # Next.js 15 (App Router), TS, Zustand, RHF+Zod


Autenticação: username/senha no endpoint /auth/login.

Autorização: o backend pode exigir userId em query string para operações em listas/tarefas.

Banco: MySQL 8 (ou compatível). HikariCP e Hibernate.

Requisitos

Java 22+

Maven 3.9+

MySQL 8+

Node 18+ (recomendado 20+)

npm 9+ (ou pnpm/yarn)

Configuração do Backend (Java/Spring Boot)
Banco de Dados (MySQL)

Crie o banco e um usuário de acesso (ajuste nomes conforme preferir):

CREATE DATABASE jtech_tasklist CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'jtech'@'%' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON jtech_tasklist.* TO 'jtech'@'%';
FLUSH PRIVILEGES;


Importante (MySQL + Hibernate): caso veja “Public Key Retrieval is not allowed”, use uma das soluções abaixo (a mais simples é ajustar a URL JDBC).

Arquivo application.yml

No diretório backend/fullstack-todo/src/main/resources/application.yml:

server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/jtech_tasklist?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: jtech
    password: secret
  jpa:
    hibernate:
      ddl-auto: update   # ou validate, conforme preferência
    open-in-view: false
    properties:
      hibernate:
        format_sql: true
  jackson:
    serialization:
      WRITE_DATES_AS_TIMESTAMPS: false

# CORS (ajuste para a porta do seu frontend)
cors:
  allowed-origins: "http://localhost:3000"


Se você guarda CORS via WebMvcConfigurer/SecurityFilterChain, mantenha como já está; acima é apenas referência.

Seed: usuário Joao/123

O backend já aceita username/senha. Basta inserir o usuário.
Use Bcrypt para a senha "123".

Gere um hash Bcrypt (qualquer forma que preferir). Exemplo rápido em Java:

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class Gen {
  public static void main(String[] args) {
    System.out.println(new BCryptPasswordEncoder().encode("123"));
  }
}


Insira no banco (ajuste o nome da tabela/colunas conforme seu schema):

-- opcional: índice único
ALTER TABLE users ADD UNIQUE KEY uq_users_username (username);

INSERT INTO users (username, password, email, role, enabled, created_at)
VALUES ('Joao', '<BCRYPT_123>', 'joao@example.com', 'USER', 1, NOW())
ON DUPLICATE KEY UPDATE username = VALUES(username);


Substitua <BCRYPT_123> pelo hash gerado.
Se seu backend cria usuários automaticamente, o passo acima pode ser opcional.

Executar o backend

Na pasta backend/fullstack-todo:

mvn spring-boot:run
# ou
mvn -DskipTests package && java -jar target/fullstack-todo-*.jar


Servidor em: http://localhost:8080

Swagger/OpenAPI

Com springdoc presente, os endpoints ficam em:

Swagger UI: http://localhost:8080/swagger-ui.html

OpenAPI JSON: http://localhost:8080/v3/api-docs

Erros comuns (e soluções)

Public Key Retrieval is not allowed (MySQL)

Solução rápida: acrescente allowPublicKeyRetrieval=true&useSSL=false na URL JDBC (como no application.yml acima).

Alternativa: criar o usuário com mysql_native_password.

ALTER USER 'jtech'@'%' IDENTIFIED WITH mysql_native_password BY 'secret';
FLUSH PRIVILEGES;


MissingServletRequestParameterException: Required request parameter 'userId'...

Seu backend exige userId como query param em algumas rotas (ex.: POST /lists?userId=1).

Garanta que o frontend sempre envie ?userId=<ID_DO_USUARIO_LOGADO> nessas operações.

Configuração do Frontend (Next.js)
Variáveis de ambiente

Crie frontend/.env.local:

NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api


Se seu backend estiver em /api, mantenha; se não, ajuste para a raiz (http://localhost:8080).

Executar o frontend

Na pasta frontend/:

npm install
npm run dev


App: http://localhost:3000

Login por username/senha

O formulário de login usa username e password.
Para testar rapidamente, use:

username: Joao

password: 123

Se quiser deixar pré-preenchido no form (opcional), defina defaultValues no seu login-form.tsx:

const form = useForm<LoginRequest>({
  defaultValues: { username: 'Joao', password: '123' }
});


Não mude o backend. O frontend já está adaptado ao contrato por username/senha.

Contrato da API (resumo prático)

Ajuste de nomes e caminhos se necessário — abaixo está o padrão mais comum, compatível com o que você descreveu e com springdoc no classpath.

Auth

POST /auth/login
Body: { "username": "Joao", "password": "123" }
Response (exemplo): { "token": "...", "user": { "id": 1, "username": "Joao" } }
O frontend salva o token (se existir) e o user.id para usar como userId.

Lists

IMPORTANTE: se o backend exige userId, sempre inclua ?userId=<id>.

GET /lists?userId=1 → TodoList[]

POST /lists?userId=1
Body: { "name": "Trabalho" } → TodoList

PUT /lists/{listId}?userId=1
Body: { "id": "xxx", "name": "Novo nome" } → TodoList

DELETE /lists/{listId}?userId=1 → 204

Tasks

GET /lists/{listId}/tasks?userId=1 → Task[]

POST /lists/{listId}/tasks?userId=1
Body: { "listId": "...", "title": "Comprar café", "description": "500g" } → Task

PUT /lists/{listId}/tasks/{taskId}?userId=1
Body: { "listId": "...", "task": { "id": "...", "done": true } } → Task

DELETE /lists/{listId}/tasks/{taskId}?userId=1 → 204

Headers: se o backend usa JWT, envie Authorization: Bearer <token>.

Checklist de verificação rápida

 Backend sobe sem erro de MySQL (allowPublicKeyRetrieval=true se necessário).

 Usuário Joao inserido com senha Bcrypt de "123".

 NEXT_PUBLIC_API_BASE_URL aponta para o backend correto.

 Frontend envia ?userId=<id> nas rotas que exigem (principal causa de 400 Bad Request).

 Se JWT: header Authorization é aplicado nas requisições autenticadas.