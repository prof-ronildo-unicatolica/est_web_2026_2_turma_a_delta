--
-- PostgreSQL database dump
--

\restrict sV967FUsxVSyeF7rmcJdhFfNNZFy6PQCbsI41kk8gfEYeQ6KXYT6bHLalbB6XG1

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: avaliacoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avaliacoes (
    id uuid DEFAULT uuidv7() NOT NULL,
    usuario_id uuid NOT NULL,
    hotel_id uuid NOT NULL,
    reserva_id uuid NOT NULL,
    nota integer NOT NULL,
    comentario text,
    data_publicacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_avaliacoes_nota CHECK (((nota >= 1) AND (nota <= 5)))
);


ALTER TABLE public.avaliacoes OWNER TO postgres;

--
-- Name: cidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cidades (
    id uuid DEFAULT uuidv7() NOT NULL,
    nome character varying(100) NOT NULL,
    estado character varying(2) NOT NULL,
    limite_territorial jsonb NOT NULL
);


ALTER TABLE public.cidades OWNER TO postgres;

--
-- Name: comodidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comodidades (
    id uuid DEFAULT uuidv7() NOT NULL,
    nome character varying(100) NOT NULL
);


ALTER TABLE public.comodidades OWNER TO postgres;

--
-- Name: hoteis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hoteis (
    id uuid DEFAULT uuidv7() NOT NULL,
    nome character varying(100) NOT NULL,
    cidade_id uuid NOT NULL,
    categoria_estrelas integer NOT NULL,
    localizacao jsonb,
    CONSTRAINT ck_hoteis_categoria_estrelas CHECK (((categoria_estrelas >= 1) AND (categoria_estrelas <= 5)))
);


ALTER TABLE public.hoteis OWNER TO postgres;

--
-- Name: hotel_comodidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_comodidades (
    hotel_id uuid NOT NULL,
    comodidade_id uuid NOT NULL
);


ALTER TABLE public.hotel_comodidades OWNER TO postgres;

--
-- Name: quartos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quartos (
    id uuid DEFAULT uuidv7() NOT NULL,
    hotel_id uuid NOT NULL,
    numero character varying(10) NOT NULL,
    tipo character varying(50) NOT NULL,
    preco_diaria numeric(10,2) NOT NULL,
    max_adultos integer NOT NULL,
    max_criancas integer DEFAULT 0 NOT NULL,
    CONSTRAINT ck_quartos_max_adultos CHECK ((max_adultos >= 1)),
    CONSTRAINT ck_quartos_max_criancas CHECK ((max_criancas >= 0)),
    CONSTRAINT ck_quartos_preco_diaria CHECK ((preco_diaria >= (0)::numeric))
);


ALTER TABLE public.quartos OWNER TO postgres;

--
-- Name: reserva_servicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reserva_servicos (
    reserva_id uuid NOT NULL,
    servico_id uuid NOT NULL,
    quantidade integer DEFAULT 1 NOT NULL,
    preco_cobrado numeric(10,2) NOT NULL,
    CONSTRAINT ck_reserva_servicos_quantidade CHECK ((quantidade >= 1))
);


ALTER TABLE public.reserva_servicos OWNER TO postgres;

--
-- Name: reservas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas (
    id uuid DEFAULT uuidv7() NOT NULL,
    usuario_id uuid NOT NULL,
    quarto_id uuid NOT NULL,
    data_checkin date NOT NULL,
    data_checkout date NOT NULL,
    quantidade_adultos integer NOT NULL,
    quantidade_criancas integer DEFAULT 0 NOT NULL,
    quantidade_bebes integer DEFAULT 0 NOT NULL,
    early_checkin boolean DEFAULT false NOT NULL,
    late_checkout boolean DEFAULT false NOT NULL,
    necessita_berco boolean DEFAULT false NOT NULL,
    tarifa_tipo character varying(20) DEFAULT 'Reembolsavel'::character varying NOT NULL,
    data_limite_cancelamento date,
    valor_multa_cancelamento numeric(10,2) DEFAULT 0 NOT NULL,
    valor_total numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'Pendente'::character varying NOT NULL,
    CONSTRAINT ck_reservas_adultos CHECK ((quantidade_adultos >= 1)),
    CONSTRAINT ck_reservas_bebes CHECK ((quantidade_bebes >= 0)),
    CONSTRAINT ck_reservas_criancas CHECK ((quantidade_criancas >= 0)),
    CONSTRAINT ck_reservas_datas CHECK ((data_checkout > data_checkin)),
    CONSTRAINT ck_reservas_status CHECK (((status)::text = ANY ((ARRAY['Pendente'::character varying, 'Confirmada'::character varying, 'Cancelada'::character varying])::text[]))),
    CONSTRAINT ck_reservas_tarifa_tipo CHECK (((tarifa_tipo)::text = ANY ((ARRAY['Reembolsavel'::character varying, 'Nao Reembolsavel'::character varying])::text[]))),
    CONSTRAINT ck_reservas_valor_multa CHECK ((valor_multa_cancelamento >= (0)::numeric)),
    CONSTRAINT ck_reservas_valor_total CHECK ((valor_total >= (0)::numeric))
);


ALTER TABLE public.reservas OWNER TO postgres;

--
-- Name: servicos_adicionais; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicos_adicionais (
    id uuid DEFAULT uuidv7() NOT NULL,
    nome character varying(100) NOT NULL,
    preco numeric(10,2) NOT NULL,
    CONSTRAINT ck_servicos_preco CHECK ((preco >= (0)::numeric))
);


ALTER TABLE public.servicos_adicionais OWNER TO postgres;

--
-- Name: tarifas_temporada; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarifas_temporada (
    id uuid DEFAULT uuidv7() NOT NULL,
    hotel_id uuid NOT NULL,
    nome character varying(100) NOT NULL,
    data_inicio date NOT NULL,
    data_fim date NOT NULL,
    multiplicador numeric(4,2) NOT NULL,
    CONSTRAINT ck_tarifas_data CHECK ((data_fim >= data_inicio)),
    CONSTRAINT ck_tarifas_multiplicador CHECK ((multiplicador > (0)::numeric))
);


ALTER TABLE public.tarifas_temporada OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id uuid DEFAULT uuidv7() NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    is_admin boolean DEFAULT false NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
f51c62be188a
\.


--
-- Data for Name: avaliacoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.avaliacoes (id, usuario_id, hotel_id, reserva_id, nota, comentario, data_publicacao) FROM stdin;
\.


--
-- Data for Name: cidades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cidades (id, nome, estado, limite_territorial) FROM stdin;
\.


--
-- Data for Name: comodidades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comodidades (id, nome) FROM stdin;
\.


--
-- Data for Name: hoteis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hoteis (id, nome, cidade_id, categoria_estrelas, localizacao) FROM stdin;
\.


--
-- Data for Name: hotel_comodidades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hotel_comodidades (hotel_id, comodidade_id) FROM stdin;
\.


--
-- Data for Name: quartos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quartos (id, hotel_id, numero, tipo, preco_diaria, max_adultos, max_criancas) FROM stdin;
\.


--
-- Data for Name: reserva_servicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reserva_servicos (reserva_id, servico_id, quantidade, preco_cobrado) FROM stdin;
\.


--
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservas (id, usuario_id, quarto_id, data_checkin, data_checkout, quantidade_adultos, quantidade_criancas, quantidade_bebes, early_checkin, late_checkout, necessita_berco, tarifa_tipo, data_limite_cancelamento, valor_multa_cancelamento, valor_total, status) FROM stdin;
\.


--
-- Data for Name: servicos_adicionais; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicos_adicionais (id, nome, preco) FROM stdin;
\.


--
-- Data for Name: tarifas_temporada; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tarifas_temporada (id, hotel_id, nome, data_inicio, data_fim, multiplicador) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nome, email, senha_hash, is_admin) FROM stdin;
\.


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: avaliacoes avaliacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes
    ADD CONSTRAINT avaliacoes_pkey PRIMARY KEY (id);


--
-- Name: avaliacoes avaliacoes_reserva_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes
    ADD CONSTRAINT avaliacoes_reserva_id_key UNIQUE (reserva_id);


--
-- Name: cidades cidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cidades
    ADD CONSTRAINT cidades_pkey PRIMARY KEY (id);


--
-- Name: comodidades comodidades_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comodidades
    ADD CONSTRAINT comodidades_nome_key UNIQUE (nome);


--
-- Name: comodidades comodidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comodidades
    ADD CONSTRAINT comodidades_pkey PRIMARY KEY (id);


--
-- Name: hoteis hoteis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hoteis
    ADD CONSTRAINT hoteis_pkey PRIMARY KEY (id);


--
-- Name: hotel_comodidades hotel_comodidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_comodidades
    ADD CONSTRAINT hotel_comodidades_pkey PRIMARY KEY (hotel_id, comodidade_id);


--
-- Name: quartos quartos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quartos
    ADD CONSTRAINT quartos_pkey PRIMARY KEY (id);


--
-- Name: reserva_servicos reserva_servicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_servicos
    ADD CONSTRAINT reserva_servicos_pkey PRIMARY KEY (reserva_id, servico_id);


--
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY (id);


--
-- Name: servicos_adicionais servicos_adicionais_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicos_adicionais
    ADD CONSTRAINT servicos_adicionais_pkey PRIMARY KEY (id);


--
-- Name: tarifas_temporada tarifas_temporada_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifas_temporada
    ADD CONSTRAINT tarifas_temporada_pkey PRIMARY KEY (id);


--
-- Name: quartos uq_quartos_hotel_numero; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quartos
    ADD CONSTRAINT uq_quartos_hotel_numero UNIQUE (hotel_id, numero);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: avaliacoes avaliacoes_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes
    ADD CONSTRAINT avaliacoes_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hoteis(id) ON DELETE CASCADE;


--
-- Name: avaliacoes avaliacoes_reserva_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes
    ADD CONSTRAINT avaliacoes_reserva_id_fkey FOREIGN KEY (reserva_id) REFERENCES public.reservas(id) ON DELETE CASCADE;


--
-- Name: avaliacoes avaliacoes_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes
    ADD CONSTRAINT avaliacoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: hoteis hoteis_cidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hoteis
    ADD CONSTRAINT hoteis_cidade_id_fkey FOREIGN KEY (cidade_id) REFERENCES public.cidades(id) ON DELETE CASCADE;


--
-- Name: hotel_comodidades hotel_comodidades_comodidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_comodidades
    ADD CONSTRAINT hotel_comodidades_comodidade_id_fkey FOREIGN KEY (comodidade_id) REFERENCES public.comodidades(id) ON DELETE CASCADE;


--
-- Name: hotel_comodidades hotel_comodidades_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_comodidades
    ADD CONSTRAINT hotel_comodidades_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hoteis(id) ON DELETE CASCADE;


--
-- Name: quartos quartos_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quartos
    ADD CONSTRAINT quartos_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hoteis(id) ON DELETE CASCADE;


--
-- Name: reserva_servicos reserva_servicos_reserva_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_servicos
    ADD CONSTRAINT reserva_servicos_reserva_id_fkey FOREIGN KEY (reserva_id) REFERENCES public.reservas(id) ON DELETE CASCADE;


--
-- Name: reserva_servicos reserva_servicos_servico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_servicos
    ADD CONSTRAINT reserva_servicos_servico_id_fkey FOREIGN KEY (servico_id) REFERENCES public.servicos_adicionais(id) ON DELETE CASCADE;


--
-- Name: reservas reservas_quarto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_quarto_id_fkey FOREIGN KEY (quarto_id) REFERENCES public.quartos(id) ON DELETE CASCADE;


--
-- Name: reservas reservas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: tarifas_temporada tarifas_temporada_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifas_temporada
    ADD CONSTRAINT tarifas_temporada_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hoteis(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict sV967FUsxVSyeF7rmcJdhFfNNZFy6PQCbsI41kk8gfEYeQ6KXYT6bHLalbB6XG1

