import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="transition-colors hover:text-accent">
              Início
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-accent">
              Informações sobre entrega
            </span>
          </div>
        </div>
      </div>

      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="mb-12 text-4xl font-bold">
            Informações sobre entrega
          </h1>

          <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                1. Atuação da NOXBYTE
              </h2>

              <p>
                A NOXBYTE funciona como um catálogo digital de ofertas e
                produtos disponíveis em marketplaces parceiros. Não realizamos
                vendas, pagamentos, separação de pedidos, envios ou entregas.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                2. Responsabilidade pela entrega
              </h2>

              <p>
                A entrega é organizada exclusivamente pelo marketplace ou
                vendedor responsável pela oferta acessada. Prazos, áreas
                atendidas, transportadoras e custos de frete são definidos pela
                loja parceira.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                3. Frete e prazo
              </h2>

              <p>
                O valor do frete e a previsão de entrega devem ser consultados
                diretamente na página da oferta. Essas informações podem variar
                conforme o produto, o vendedor, o endereço informado e as
                condições vigentes no momento da compra.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                4. Rastreamento do pedido
              </h2>

              <p>
                Após concluir a compra no marketplace, consulte o acompanhamento
                do pedido pelos canais fornecidos pela própria loja, como
                aplicativo, site, e-mail ou código de rastreamento.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                5. Problemas com a entrega
              </h2>

              <p>
                Em casos de atraso, extravio, dano, endereço incorreto ou
                qualquer outra ocorrência, entre em contato diretamente com o
                suporte do marketplace em que a compra foi realizada. A NOXBYTE
                não possui acesso ao pedido nem aos dados da entrega.
              </p>
            </div>

            <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
              <p className="text-sm">
                <strong>Última atualização:</strong> agosto de 2026
              </p>

              <p className="mt-2 text-sm">
                Antes de finalizar uma compra, confira o prazo, o frete e as
                condições apresentadas pela loja parceira.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShippingPolicy;
