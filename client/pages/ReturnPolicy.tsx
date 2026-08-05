import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="transition-colors hover:text-accent"
            >
              Início
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-accent">
              Trocas, devoluções e reembolsos
            </span>
          </div>
        </div>
      </div>

      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="mb-12 text-4xl font-bold">
            Trocas, devoluções e reembolsos
          </h1>

          <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                1. Atuação da NOXBYTE
              </h2>

              <p>
                A NOXBYTE atua como catálogo digital e agregador
                de ofertas. Não realiza vendas, não recebe
                pagamentos e não possui acesso aos pedidos feitos
                nos marketplaces parceiros.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                2. Regras da loja parceira
              </h2>

              <p>
                Prazos, condições e procedimentos para
                cancelamentos, trocas, devoluções, garantias e
                reembolsos são definidos exclusivamente pelo
                marketplace ou vendedor responsável pela compra.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                3. Como solicitar atendimento
              </h2>

              <p>
                Acesse sua conta no marketplace em que a compra
                foi concluída, localize o pedido e utilize os
                canais de atendimento disponibilizados pela
                própria plataforma.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                4. Produtos com defeito ou divergência
              </h2>

              <p>
                Caso o produto apresente defeito, dano, item
                incorreto ou qualquer divergência em relação à
                oferta, registre a ocorrência diretamente no
                marketplace e preserve comprovantes, imagens e
                informações do pedido.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                5. Acompanhamento da solicitação
              </h2>

              <p>
                O andamento e o resultado da solicitação devem ser
                acompanhados junto à loja parceira. A NOXBYTE não
                consegue autorizar devoluções, emitir etiquetas,
                realizar trocas ou processar reembolsos.
              </p>
            </div>

            <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
              <p className="text-sm">
                <strong>Última atualização:</strong> agosto de
                2026
              </p>

              <p className="mt-2 text-sm">
                Antes de comprar, consulte as políticas apresentadas
                pelo marketplace responsável pela oferta.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ReturnPolicy;