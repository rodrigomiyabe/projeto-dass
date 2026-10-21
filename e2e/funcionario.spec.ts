import { test, expect } from '@playwright/test';

// Synthetic test data only — not a real person.
const CPF = '123.456.789-09';
const NOME = 'Ana Teste E2E';
const EMAIL = 'ana.e2e@example.com';

test('cadastrar, pesquisar, editar e excluir um funcionário', async ({ page }) => {
  // Accept the browser confirm() dialog triggered by "Excluir" automatically.
  page.on('dialog', (dialog) => dialog.accept());

  // --- Cadastrar ---
  await page.goto('/');
  await page.getByRole('button', { name: 'Novo funcionário' }).click();
  await expect(page).toHaveURL(/\/novo$/);

  await page.locator('#cpf').fill(CPF);
  await page.locator('#nome').fill(NOME);
  await page.locator('#email').fill(EMAIL);
  await page.locator('#tamanhoCamiseta').selectOption('M');
  await page.locator('#tamanhoCalcado').fill('38');

  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByText('Funcionário salvo com sucesso.')).toBeVisible();
  await expect(page).toHaveURL('/');

  const linha = page.locator('tr', { hasText: NOME });
  await expect(linha).toHaveCount(1);
  await expect(linha.locator('td[data-rotulo="Camiseta"]')).toHaveText('M');

  // --- Pesquisar ---
  await page.locator('#filtro-nome').fill(NOME);
  await page.getByRole('button', { name: 'Pesquisar' }).click();

  const linhasFiltradas = page.locator('tbody tr');
  await expect(linhasFiltradas).toHaveCount(1);
  await expect(linhasFiltradas).toContainText(NOME);

  // --- Editar ---
  await linhasFiltradas.getByRole('button', { name: 'Editar' }).click();
  await expect(page).toHaveURL(/\/editar\/\d+$/);

  await page.locator('#tamanhoCamiseta').selectOption('G');
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByText('Funcionário salvo com sucesso.')).toBeVisible();
  await expect(page).toHaveURL('/');

  const linhaAtualizada = page.locator('tr', { hasText: NOME });
  await expect(linhaAtualizada).toHaveCount(1);
  await expect(linhaAtualizada.locator('td[data-rotulo="Camiseta"]')).toHaveText('G');

  // --- Excluir ---
  await linhaAtualizada.getByRole('button', { name: 'Excluir' }).click();

  await expect(page.getByText('Funcionário excluído com sucesso.')).toBeVisible();
  await expect(page.locator('tr', { hasText: NOME })).toHaveCount(0);
});
