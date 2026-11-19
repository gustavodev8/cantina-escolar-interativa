# Cantina Escolar Interativa

Protótipo funcional inspirado na referência do Figma Make. Ele simula o fluxo do estudante (cardápio, sacola, pedido e acompanhamento) e do atendente (novos pedidos, preparo, prontos e estoque).

## Demonstração

- A tela inicial exige login. Use os botões de **acesso rápido** para preencher as credenciais de demonstração.
- Estudante: `aluno@cantina.local` / `Aluno123!`.
- Atendente: `atendente@cantina.local` / `Atendente123!`.
- Escolha **Estudante** para adicionar itens, revisar a sacola e confirmar o pedido.
- Escolha **Atendente** para avançar cada pedido entre as colunas e marcar itens como esgotados.
- Os dados ficam no navegador com `localStorage`; abra outra aba para demonstrar os dois papéis ao mesmo tempo.
- O botão **Restaurar demonstração** repõe o estado inicial se necessário.

## Executar localmente

```bash
npm install
npm run dev
```
