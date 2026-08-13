import { Card, CardContent, CardHeader } from "@heroui/react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tietosuojaseloste",
  description:
    "Miten hääkutsupalvelussa käsitellään vieraiden henkilötietoja (GDPR).",
};

/** Contact address published for data subject requests. */
const CONTACT_EMAIL = "contact@kse.li";

/** Date this notice was last reviewed. Update when the content changes. */
const LAST_UPDATED = "13.8.2026";

type SectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
};

const Section = ({ id, title, children }: SectionProps) => (
  <section id={id} className="flex flex-col gap-3 scroll-mt-8">
    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    <div className="flex flex-col gap-3 text-gray-700 leading-relaxed">
      {children}
    </div>
  </section>
);

const List = ({ children }: { children: React.ReactNode }) => (
  <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-gray-400">
    {children}
  </ul>
);

type PurposeProps = {
  purpose: string;
  data: string;
  basis: string;
};

const Purpose = ({ purpose, data, basis }: PurposeProps) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
    <h3 className="font-semibold text-gray-900">{purpose}</h3>
    <dl className="mt-2 flex flex-col gap-1 text-sm">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
        <dt className="shrink-0 font-medium text-gray-900 sm:w-32">
          Käsiteltävät tiedot
        </dt>
        <dd className="text-gray-700">{data}</dd>
      </div>
      <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
        <dt className="shrink-0 font-medium text-gray-900 sm:w-32">
          Oikeusperuste
        </dt>
        <dd className="text-gray-700">{basis}</dd>
      </div>
    </dl>
  </div>
);

const PrivacyPolicyPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4 py-10">
      <Card className="mx-auto w-full max-w-3xl shadow-xl pt-4">
        <CardHeader className="flex flex-col gap-2 pb-4 pt-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tietosuojaseloste
          </h1>
          <p className="text-sm text-gray-600">Päivitetty {LAST_UPDATED}</p>
        </CardHeader>

        <CardContent className="gap-8 pb-10">
          <Section id="rekisterinpitaja" title="1. Rekisterinpitäjä">
            <p>
              Tämän hääkutsupalvelun rekisterinpitäjä on yksityishenkilö Akseli
              Kolari.
            </p>
            <p>
              Yhteydenotot henkilötietojen käsittelyä koskevissa asioissa:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-blue-700 underline hover:text-blue-900"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <p>
              Rekisterinpitäjällä ei ole velvollisuutta nimittää erillistä
              tietosuojavastaavaa, joten kaikissa tätä selostetta koskevissa
              kysymyksissä voit olla yhteydessä suoraan yllä olevaan
              osoitteeseen.
            </p>
          </Section>

          <Section id="soveltamisala" title="2. Mitä tämä seloste koskee">
            <p>
              Tämä seloste kuvaa, miten hääkutsupalvelussa (jäljempänä
              ”palvelu”) käsitellään hääjuhlaan kutsuttujen vieraiden sekä
              palvelun ylläpitäjien henkilötietoja. Käsittely tapahtuu EU:n
              yleisen tietosuoja-asetuksen (GDPR) ja Suomen tietosuojalain
              mukaisesti.
            </p>
            <p>
              Palvelu on tarkoitettu yksinomaan yhden yksityisen hääjuhlan
              järjestämiseen. Kyseessä ei ole kaupallinen palvelu: tietoja ei
              käytetä liiketoimintaan eikä markkinointiin, eikä niitä myydä tai
              luovuteta ulkopuolisille.
            </p>
          </Section>

          <Section
            id="tiedot"
            title="3. Käsiteltävät henkilötiedot ja tietolähteet"
          >
            <h3 className="font-semibold text-gray-900">
              3.1 Tiedot, jotka syötämme itse etukäteen
            </h3>
            <List>
              <li>kutsuttavan nimi</li>
              <li>kutsukoodi</li>
              <li>kutsun kattama vieraiden enimmäismäärä</li>
              <li>
                vapaamuotoinen sisäinen muistiinpano kutsuun liittyvistä
                käytännön asioista
              </li>
            </List>
            <p className="text-sm text-gray-600">
              Tietolähde: hääparin oma vieraslista.
            </p>

            <h3 className="font-semibold text-gray-900">
              3.2 Tiedot, jotka annat itse vastauslomakkeella
            </h3>
            <List>
              <li>sähköpostiosoite</li>
              <li>tieto siitä, osallistutko juhlaan</li>
              <li>osallistujien lukumäärä ja kunkin osallistujan nimi</li>
              <li>ruokarajoitteet ja ruoka-aineallergiat (vapaaehtoinen)</li>
              <li>tarve bussikuljetukselle</li>
              <li>vapaamuotoinen viesti hääparille (vapaaehtoinen)</li>
            </List>
            <p className="text-sm text-gray-600">
              Tietolähde: sinä itse. Tiedot annetaan vapaaehtoisesti.
            </p>

            <h3 className="font-semibold text-gray-900">
              3.3 Palvelun toiminnan edellyttämät tekniset tiedot
            </h3>
            <List>
              <li>
                kirjautumisistunnon tunniste evästeessä sekä istunnon
                voimassaolo- ja käyttöaikaleimat
              </li>
              <li>
                sähköpostin vahvistamiseen käytetty kertakäyttökoodi, joka
                tallennetaan vain tiivisteenä, sekä epäonnistuneiden yritysten
                määrä
              </li>
              <li>tietueiden luonti- ja muokkausaikaleimat</li>
            </List>

            <h3 className="font-semibold text-gray-900">
              3.4 Palvelun ylläpitäjien tiedot
            </h3>
            <List>
              <li>nimi ja sähköpostiosoite</li>
              <li>käyttöoikeusrooli ja tilin tila</li>
              <li>
                salasanan tiiviste tai passkey-tunnistautumisen julkinen avain
                ja laitetiedot
              </li>
              <li>kirjautumisistunnon IP-osoite ja selaintunniste</li>
            </List>
          </Section>

          <Section
            id="tarkoitukset"
            title="4. Käsittelyn tarkoitukset ja oikeusperusteet"
          >
            <p>
              Käsittelemme henkilötietoja vain alla kuvattuihin tarkoituksiin ja
              vain siltä osin kuin se on juhlan järjestämisen kannalta
              tarpeellista.
            </p>
            <Purpose
              purpose="Kutsun toimittaminen ja vieraslistan hallinta"
              data="nimi, kutsukoodi, vieraiden enimmäismäärä, sisäinen muistiinpano"
              basis="oikeutettu etu (GDPR 6 art. 1 f) — hääjuhlan järjestäminen ja kutsuttujen tavoittaminen"
            />
            <Purpose
              purpose="Osallistumisvahvistuksen vastaanotto ja juhlan käytännön järjestelyt"
              data="sähköpostiosoite, osallistumistieto, osallistujien nimet ja lukumäärä, bussikuljetustarve, viesti hääparille"
              basis="suostumus (GDPR 6 art. 1 a) — annat tiedot vapaaehtoisesti vastauslomakkeella"
            />
            <Purpose
              purpose="Tarjoilun ja erityisruokavalioiden suunnittelu"
              data="ruokarajoitteet ja ruoka-aineallergiat"
              basis="nimenomainen suostumus (GDPR 6 art. 1 a ja 9 art. 2 a) — katso kohta 5"
            />
            <Purpose
              purpose="Vahvistusviestien ja vastauksen muokkaamiseen tarvittavien koodien lähettäminen"
              data="sähköpostiosoite, kertakäyttökoodin tiiviste"
              basis="suostumus (GDPR 6 art. 1 a) sekä oikeutettu etu (6 art. 1 f) palvelun toteuttamiseksi"
            />
            <Purpose
              purpose="Palvelun tietoturva ja väärinkäytön estäminen"
              data="istuntotiedot, IP-osoite, selaintunniste, epäonnistuneiden yritysten määrä"
              basis="oikeutettu etu (GDPR 6 art. 1 f) — kutsuttujen tietojen suojaaminen"
            />
            <Purpose
              purpose="Ylläpitäjien tunnistaminen ja käyttöoikeuksien hallinta"
              data="ylläpitäjän nimi, sähköpostiosoite, tunnistautumistiedot, rooli"
              basis="oikeutettu etu (GDPR 6 art. 1 f) — palvelun hallinnointi"
            />
          </Section>

          <Section
            id="terveystiedot"
            title="5. Ruokavalio- ja terveystiedot (erityiset henkilötietoryhmät)"
          >
            <p>
              Ruokarajoitteita ja ruoka-aineallergioita koskevat tiedot voivat
              paljastaa terveyteesi liittyviä seikkoja. Tällaiset tiedot
              kuuluvat GDPR:n 9 artiklan mukaisiin erityisiin
              henkilötietoryhmiin, ja käsittelemme niitä ainoastaan antamasi
              nimenomaisen suostumuksen perusteella (9 art. 2 a).
            </p>
            <p>
              Tietojen antaminen on täysin vapaaehtoista. Voit jättää kentän
              tyhjäksi ja kertoa asiasta meille suoraan, jos et halua tallentaa
              tietoa palveluun.
            </p>
            <p>
              Käytämme tietoa vain tarjoilun suunnitteluun. Välitämme sen juhlan
              tarjoilusta vastaavalle pitopalvelulle ainoastaan siinä
              laajuudessa kuin ruokavalion toteuttaminen edellyttää, ja
              mahdollisuuksien mukaan ilman nimeäsi.
            </p>
          </Section>

          <Section
            id="toisen-puolesta"
            title="6. Toisen henkilön puolesta annetut tiedot"
          >
            <p>
              Vastauslomakkeella voit ilmoittaa myös seuralaisesi tai
              perheenjäsentesi nimet ja ruokarajoitteet. Pyydämme, että kerrot
              heille tästä selosteesta ennen tietojen antamista. Myös heillä on
              kaikki kohdassa 13 kuvatut oikeudet.
            </p>
          </Section>

          <Section id="emme-tee" title="7. Mitä emme tee">
            <List>
              <li>
                emme myy, vuokraa emmekä luovuta tietoja
                markkinointitarkoituksiin
              </li>
              <li>
                emme lähetä markkinointi- tai uutiskirjeviestejä — lähetämme
                vain juhlaan liittyviä vahvistus- ja tiedotusviestejä
              </li>
              <li>
                emme profiloi käyttäjiä emmekä tee automaattista päätöksentekoa,
                jolla olisi sinua koskevia oikeusvaikutuksia
              </li>
              <li>
                emme käytä kävijäseurantaa, analytiikkatyökaluja emmekä
                mainosevästeitä
              </li>
            </List>
          </Section>

          <Section id="evasteet" title="8. Evästeet">
            <p>
              Palvelu käyttää ainoastaan toiminnan kannalta välttämättömiä
              evästeitä:
            </p>
            <List>
              <li>
                kutsuistunnon eväste, jonka avulla pysyt kirjautuneena
                kutsukoodilla
              </li>
              <li>ylläpitäjän kirjautumisistunnon eväste</li>
            </List>
            <p>
              Koska evästeet ovat välttämättömiä palvelun toiminnalle, niiden
              käyttöön ei pyydetä erillistä suostumusta (laki sähköisen
              viestinnän palveluista 205 §). Evästeet poistuvat, kun kirjaudut
              ulos tai kun istunto vanhenee.
            </p>
          </Section>

          <Section
            id="vastaanottajat"
            title="9. Tietojen vastaanottajat ja käsittelijät"
          >
            <p>
              Henkilötietoja käsittelevät hääparin lisäksi vain seuraavat
              toimeksiannostamme toimivat palveluntarjoajat, joiden kanssa on
              tehty GDPR:n edellyttämä käsittelysopimus:
            </p>
            <List>
              <li>
                <span className="font-medium text-gray-900">Vercel Inc.</span>{" "}
                (Yhdysvallat) — palvelun tekninen alusta ja käyttö
              </li>
              <li>
                <span className="font-medium text-gray-900">Neon Inc.</span>{" "}
                (Yhdysvallat, osa Databricks-konsernia) — tietokantapalvelu,
                jossa tiedot säilytetään
              </li>
              <li>
                <span className="font-medium text-gray-900">Scaleway SAS</span>{" "}
                (Ranska) — lähtevien sähköpostiviestien välitys
              </li>
            </List>
            <p>
              Lisäksi juhlan tarjoilusta vastaavalle pitopalvelulle voidaan
              toimittaa yhteenveto ruokavalioista ja allergioista tarjoilun
              toteuttamiseksi.
            </p>
            <p>
              Emme luovuta henkilötietoja muille tahoille, ellei siihen ole
              lakisääteistä velvollisuutta.
            </p>
          </Section>

          <Section
            id="siirrot"
            title="10. Tietojen siirto EU:n ja ETA:n ulkopuolelle"
          >
            <p>
              Tiedot säilytetään ja sähköpostiliikenne välitetään EU:n alueella
              sijaitsevilla palvelimilla. Kaksi käyttämistämme
              palveluntarjoajista — Vercel Inc. ja Neon Inc. — on kuitenkin
              yhdysvaltalaisia yhtiöitä, joten teknisen ylläpidon ja tuen
              yhteydessä henkilötietoja voi siirtyä tai olla saatavilla EU:n ja
              ETA:n ulkopuolella.
            </p>
            <p>
              Näiden siirtojen suojatoimina käytetään Euroopan komission
              hyväksymiä vakiosopimuslausekkeita (SCC, GDPR 46 art. 2 c) sekä
              EU–Yhdysvallat-tietosuojakehystä (Data Privacy Framework) niiltä
              osin kuin palveluntarjoaja on siihen sertifioitu. Muita siirtoja
              kolmansiin maihin ei tehdä.
            </p>
          </Section>

          <Section id="sailytys" title="11. Säilytysaika">
            <p>
              Poistamme kaikki vieraita koskevat henkilötiedot viimeistään
              kuuden kuukauden kuluttua hääjuhlasta, minkä jälkeen palvelu
              suljetaan. Lisäksi:
            </p>
            <List>
              <li>kutsuistunnot vanhenevat automaattisesti ja poistetaan</li>
              <li>
                sähköpostin vahvistuskoodit vanhenevat lyhyessä ajassa ja
                poistetaan
              </li>
              <li>
                ylläpitäjien tunnukset poistetaan palvelun sulkemisen yhteydessä
              </li>
            </List>
            <p>
              Voit myös pyytää tietojesi poistamista aiemmin. Huomaa, että
              tällöin emme voi enää ottaa huomioon ilmoittamiasi toiveita juhlan
              järjestelyissä.
            </p>
          </Section>

          <Section id="tietoturva" title="12. Tietoturva">
            <List>
              <li>kaikki yhteydet palveluun on salattu (HTTPS)</li>
              <li>
                pääsy vieraiden tietoihin on vain erikseen hyväksytyillä
                ylläpitäjätileillä
              </li>
              <li>
                ylläpitäjien kirjautuminen tukee passkey-tunnistautumista, eikä
                salasanoja tallenneta selväkielisinä
              </li>
              <li>
                kutsu- ja vahvistuskoodit ovat aikarajoitettuja, ja
                vahvistuskoodit tallennetaan vain tiivisteenä
              </li>
              <li>
                tiedot säilytetään palveluntarjoajien suojatuissa konesaleissa
              </li>
            </List>
          </Section>

          <Section id="oikeudet" title="13. Rekisteröidyn oikeudet">
            <p>Sinulla on oikeus</p>
            <List>
              <li>saada pääsy sinua koskeviin tietoihin (GDPR 15 art.)</li>
              <li>oikaista virheelliset tai puutteelliset tiedot (16 art.)</li>
              <li>saada tietosi poistetuksi (17 art.)</li>
              <li>rajoittaa tietojesi käsittelyä (18 art.)</li>
              <li>
                siirtää koneluettavassa muodossa ne tiedot, jotka olet itse
                antanut suostumuksesi perusteella (20 art.)
              </li>
              <li>
                vastustaa oikeutettuun etuun perustuvaa käsittelyä (21 art.)
              </li>
              <li>
                peruuttaa antamasi suostumus milloin tahansa (7 art. 3 kohta) —
                peruuttaminen ei vaikuta ennen sitä tehdyn käsittelyn
                lainmukaisuuteen
              </li>
            </List>
            <p>
              Suurimman osan tiedoistasi voit tarkistaa ja korjata itse
              kirjautumalla palveluun kutsukoodillasi. Muissa asioissa ota
              yhteyttä osoitteeseen{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-blue-700 underline hover:text-blue-900"
              >
                {CONTACT_EMAIL}
              </a>
              . Vastaamme pyyntöön ilman aiheetonta viivytystä ja viimeistään
              kuukauden kuluessa. Voimme pyytää sinua vahvistamaan
              henkilöllisyytesi ennen pyynnön toteuttamista.
            </p>
          </Section>

          <Section id="valitus" title="14. Oikeus tehdä valitus">
            <p>
              Jos katsot, että henkilötietojasi käsitellään
              tietosuojalainsäädännön vastaisesti, voit tehdä valituksen
              valvontaviranomaiselle:
            </p>
            <address className="not-italic text-gray-700">
              Tietosuojavaltuutetun toimisto
              <br />
              Lintulahdenkuja 4, 00530 Helsinki
              <br />
              PL 800, 00531 Helsinki
              <br />
              puh. 029 566 6700
              <br />
              <a
                href="mailto:tietosuoja@om.fi"
                className="font-medium text-blue-700 underline hover:text-blue-900"
              >
                tietosuoja@om.fi
              </a>
              <br />
              <a
                href="https://tietosuoja.fi"
                className="font-medium text-blue-700 underline hover:text-blue-900"
                target="_blank"
                rel="noreferrer"
              >
                tietosuoja.fi
              </a>
            </address>
          </Section>

          <Section id="muutokset" title="15. Muutokset tähän selosteeseen">
            <p>
              Voimme päivittää tätä selostetta esimerkiksi palvelun toiminnan
              muuttuessa. Ajantasainen versio on aina saatavilla tässä
              osoitteessa. Merkittävistä muutoksista ilmoitamme kutsutuille
              sähköpostitse.
            </p>
            <p className="text-sm text-gray-600">
              Tämä seloste on päivitetty {LAST_UPDATED}.
            </p>
          </Section>

          <div className="border-t border-gray-200 pt-6">
            <Link
              href="/"
              className="text-sm font-medium text-blue-700 underline hover:text-blue-900"
            >
              ← Takaisin etusivulle
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default PrivacyPolicyPage;
