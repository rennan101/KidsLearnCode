# Modelos de E-mail do Supabase em PT-BR (Kids Learn Code - Ilha Lua)

Este documento contém os modelos de e-mail prontos para configuração no painel do **Supabase** (**Authentication -> Email Templates**), com layout responsivo acolhedor no padrão visual da **Ilha Lua (Kids Learn Code)** e em total conformidade com a legislação brasileira (**ECA - Lei 8.069/90** e **LGPD**).

---

## 1. Confirmação de Cadastro / Ativação do Passaporte (Confirm Signup)

### Assunto do E-mail (Subject):
```text
Ative seu Passaporte da Ilha Lua - Kids Learn Code
```

### Código HTML do Template:
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kids Learn Code - Confirmação de E-mail</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f8f0; font-family: 'Nunito', Arial, sans-serif; color: #794f27;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f8f0; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Container Card Principal -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #fdfbf7; border: 3.5px solid #7a583e; border-radius: 28px; overflow: hidden; box-shadow: 0 14px 35px rgba(80, 50, 20, 0.15);">
          
          <!-- Cabeçalho com Gradiente Menta ACNH -->
          <tr>
            <td align="center" style="background: linear-gradient(180deg, #19c8b9 0%, #0f8e83 100%); padding: 24px 20px; border-bottom: 3.5px solid #7a583e;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.25);">
                Kids Learn Code
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #e6f9f6; letter-spacing: 0.5px;">
                Ilha Lua &bull; Aventura, Construção e Programação
              </p>
            </td>
          </tr>

          <!-- Corpo da Mensagem -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #794f27;">
                Bem-vindo(a) à Ilha, Aventureiro(a)!
              </h2>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #725d42; font-weight: 600;">
                Seu cadastro no jogo <strong>Kids Learn Code</strong> foi recebido com sucesso! Para validar o seu passaporte de morador e liberar seu acesso ilimitado à Ilha Lua, confirme o seu endereço de e-mail clicando no botão abaixo:
              </p>

              <!-- Botão 3D Tátil Animal Island UI -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px auto;">
                <tr>
                  <td align="center" style="border-radius: 50px; background-color: #19c8b9; box-shadow: 0 4px 0 0 #0f8e83;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 16px; font-weight: 800; color: #ffffff; text-decoration: none; border-radius: 50px; letter-spacing: 0.5px;">
                      Confirmar e Entrar no Jogo
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Caixa Informativa / Dica -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7f3df; border: 2px solid #c4b89e; border-radius: 16px; margin-top: 24px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #794f27; font-weight: 700;">
                      <strong>Dica da Ilha:</strong> Assim que você confirmar, a aba do jogo no seu navegador será ativada automaticamente com seus itens, companheiro dragão e missões de código!
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 12px; color: #9f927d; line-height: 1.4;">
                Se você não solicitou a criação desta conta no jogo Kids Learn Code, por favor desconsidere este e-mail.
              </p>
            </td>
          </tr>

          <!-- Rodapé do E-mail -->
          <tr>
            <td align="center" style="background-color: #f7f3df; padding: 16px 20px; border-top: 2px solid #c4b89e;">
              <p style="margin: 0; font-size: 12px; font-weight: 700; color: #725d42;">
                Kids Learn Code &bull; Plataforma Educacional de Programação em Jogos 2D
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Autorização de Pais e Responsáveis Legais (ECA - Lei 8.069/90)

Se você utilizar um template específico para autorização de menores:

### Assunto do E-mail (Subject):
```text
Autorização de Acesso - Kids Learn Code (ECA - Lei 8.069/90)
```

### Código HTML do Template:
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kids Learn Code - Autorização do Responsável Legal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f8f0; font-family: 'Nunito', Arial, sans-serif; color: #794f27;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f8f0; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #fdfbf7; border: 3.5px solid #7a583e; border-radius: 28px; overflow: hidden; box-shadow: 0 14px 35px rgba(80, 50, 20, 0.15);">
          
          <!-- Cabeçalho -->
          <tr>
            <td align="center" style="background: linear-gradient(180deg, #19c8b9 0%, #0f8e83 100%); padding: 24px 20px; border-bottom: 3.5px solid #7a583e;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">
                Kids Learn Code
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #e6f9f6;">
                Autorização de Acesso de Menor de Idade
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 16px 0; font-size: 19px; font-weight: 800; color: #794f27;">
                Olá, Pai, Mãe ou Responsável Legal!
              </h2>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #725d42; font-weight: 600;">
                Um cadastro foi iniciado para jogar o <strong>Kids Learn Code</strong>, uma plataforma lúdica e segura desenvolvida para ensinar lógica e programação de computadores através de aventuras na <strong>Ilha Lua</strong>.
              </p>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #725d42; font-weight: 600;">
                Em cumprimento ao <strong>Estatuto da Criança e do Adolescente (ECA - Lei Federal 8.069/90)</strong> e à <strong>LGPD</strong>, solicitamos o seu consentimento explícito para a ativação do perfil da criança.
              </p>

              <!-- Botão de Autorização -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px auto;">
                <tr>
                  <td align="center" style="border-radius: 50px; background-color: #19c8b9; box-shadow: 0 4px 0 0 #0f8e83;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 16px; font-weight: 800; color: #ffffff; text-decoration: none; border-radius: 50px;">
                      Autorizar Acesso ao Jogo
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 12px; color: #9f927d; line-height: 1.4;">
                Se você não reconhece esta solicitação, nenhuma ação é necessária e a conta não será ativada.
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td align="center" style="background-color: #f7f3df; padding: 16px 20px; border-top: 2px solid #c4b89e;">
              <p style="margin: 0; font-size: 12px; font-weight: 700; color: #725d42;">
                Kids Learn Code &bull; Ambiente 100% Seguro e Educativo para Crianças
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Redefinição de Senha (Reset Password)

### Assunto do E-mail (Subject):
```text
Recupere sua Senha da Ilha Lua - Kids Learn Code
```

### Código HTML do Template:
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kids Learn Code - Redefinição de Senha</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f8f0; font-family: 'Nunito', Arial, sans-serif; color: #794f27;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f8f0; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #fdfbf7; border: 3.5px solid #7a583e; border-radius: 28px; overflow: hidden; box-shadow: 0 14px 35px rgba(80, 50, 20, 0.15);">
          
          <tr>
            <td align="center" style="background: linear-gradient(180deg, #19c8b9 0%, #0f8e83 100%); padding: 24px 20px; border-bottom: 3.5px solid #7a583e;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">
                Kids Learn Code
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #e6f9f6;">
                Recuperação do Passaporte da Ilha
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #794f27;">
                Redefinição de Senha
              </h2>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #725d42; font-weight: 600;">
                Recebemos um pedido para alterar a senha da sua conta no jogo <strong>Kids Learn Code</strong>. Clique no botão abaixo para escolher uma nova senha de acesso:
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px auto;">
                <tr>
                  <td align="center" style="border-radius: 50px; background-color: #19c8b9; box-shadow: 0 4px 0 0 #0f8e83;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 16px; font-weight: 800; color: #ffffff; text-decoration: none; border-radius: 50px;">
                      Criar Nova Senha
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 12px; color: #9f927d; line-height: 1.4;">
                Se você não solicitou a troca de senha, pode ignorar esta mensagem com segurança.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="background-color: #f7f3df; padding: 16px 20px; border-top: 2px solid #c4b89e;">
              <p style="margin: 0; font-size: 12px; font-weight: 700; color: #725d42;">
                Kids Learn Code &bull; Aventura, Construção e Programação
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Como Configurar no Supabase Dashboard:

1. Acesse o painel do seu projeto no **[Supabase](https://supabase.com/dashboard)**.
2. No menu lateral, clique em **Authentication -> Email Templates**.
3. Na aba **Confirm signup**:
   - Cole o assunto: `Ative seu Passaporte da Ilha Lua - Kids Learn Code`
   - Cole o código HTML do **Item 1** acima.
4. Na aba **Reset password**:
   - Cole o assunto: `Recupere sua Senha da Ilha Lua - Kids Learn Code`
   - Cole o código HTML do **Item 3** acima.
5. Clique em **Save** em cada aba para salvar as alterações.
