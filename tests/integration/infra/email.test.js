import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Remetente1 <remetente1@test.dev>",
      to: "destinatario1@test.dev",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });
    await email.send({
      from: "Remetente2 <remetente2@test.dev>",
      to: "destinatario2@test.dev",
      subject: "Último email enviado",
      text: "Corpo do último email.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<remetente2@test.dev>");
    expect(lastEmail.recipients[0]).toBe("<destinatario2@test.dev>");
    expect(lastEmail.subject).toBe("Último email enviado");
    expect(lastEmail.text).toBe("Corpo do último email.\r\n");
  });
});
