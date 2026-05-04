-- Script definitivo con 11 columnas, géneros y sinopsis completas
-- Tabla: book
-- Estructura: (id, nombre_libro, autor, estanteria, balda, cod_barras, prestado, genero, sinopsis, image_url, hidden)

USE `biblioteca`;

INSERT INTO `book` (`id`, `nombre_libro`, `autor`, `estanteria`, `balda`, `cod_barras`, `prestado`, `genero`, `sinopsis`, `image_url`, `hidden`) VALUES
(2, 'TODA UNA VIDA', 'CARLOS ABADÍA', 1, 1, 10000000, 0, 'Novela contemporánea', 'La historia de un guerrillero del maquis que busca refugio en la Sevilla de posguerra, explorando la memoria y la supervivencia.', NULL, 0),
(3, 'ALAS CORTADAS', 'JOSÉ ACOSTA MONTORO', 1, 1, 10000003, 0, 'Narrativa española', 'Una profunda reflexión sobre las limitaciones impuestas por la sociedad y la búsqueda de la libertad personal.', NULL, 0),
(4, 'LA CHICA DEL COLUMPIO', 'RICHARD ADAMS', 1, 1, 10000029, 0, 'Suspense / Terror gótico', 'Un anticuario se enamora de una misteriosa mujer cuya vida se ve envuelta en fenómenos sobrenaturales tras adquirir una figura de porcelana.', NULL, 0),
(5, 'ENTRE BEIRO Y DAURO', 'ANTONIO JOAQUÍN AFÁN DE RIBERA', 1, 1, 10000053, 0, 'Costumbrismo', 'Relatos que capturan la esencia y las tradiciones de Granada a través de sus paisajes y sus gentes.', NULL, 0),
(6, 'DESIDERIO', 'IGNACIO AGUSTÍ ', 1, 1, 10000077, 0, 'Novela histórica', 'Crónica de la burguesía catalana en un periodo de grandes transformaciones sociales y políticas.', NULL, 0),
(7, 'LA NIETA DE LA MAHARANÍ', 'MAHA AKHTAR', 1, 1, 10000101, 0, 'Memorias / Autobiografía', 'La autora descubre sus raíces reales en la India y emprende un viaje para reclamar su identidad y herencia familiar.', NULL, 0),
(8, 'LA REGENTA II', 'LEOPOLDO ALAS ', 1, 1, 10000183, 0, 'Realismo', 'Segunda parte de la magistral crítica a la hipocresía de la sociedad española del siglo XIX en la ciudad de Vetusta.', NULL, 0),
(9, 'LA REGENTA I', 'LEOPOLDO ALAS ', 1, 1, 10000111, 0, 'Realismo', 'Primera parte de la historia de Ana Ozores y su lucha interna entre el deber moral y el deseo prohibido.', NULL, 0),
(10, 'LA REGENTA', 'LEOPOLDO ALAS ', 1, 1, 10000027, 0, 'Realismo / Naturalismo', 'Obra cumbre de la literatura española que retrata el ambiente asfixiante de una ciudad de provincias.', NULL, 0),
(11, 'LA REGENTA', 'LEOPOLDO ALAS ', 1, 1, 10000051, 0, 'Realismo', 'Edición íntegra de la tragedia de Ana Ozores frente a la moralidad de la Restauración.', NULL, 0),
(12, 'SOLAS', 'CARMEN ALBORCH', 1, 1, 10000125, 0, 'Ensayo / Sociología', 'Un análisis sobre la soledad elegida y el crecimiento personal de las mujeres en la sociedad moderna.', NULL, 0),
(13, 'MEMORIAS DE VILLANERÍAS', 'JUAN ALCAIDE DE LA VEGA', 1, 1, 10000075, 0, 'Poesía / Narrativa rural', 'Evocación lírica de la vida en el campo y las raíces manchegas del autor.', NULL, 0),
(14, 'YOUNG SÁNCHEZ Y OTROS CUENTOS', 'IGNACIO ALDECOA', 1, 1, 10000099, 0, 'Relato corto / Realismo', 'Historias que retratan la vida de la clase trabajadora y el mundo del boxeo con una sensibilidad única.', NULL, 0),
(15, 'EL AMIGO DE LA MUERTE Y OTRO RELATO', 'PEDRO ANTONIO DE ALARCON', 1, 1, 10000123, 0, 'Cuento fantástico', 'Relatos que exploran temas románticos y sobrenaturales con el estilo característico del autor decimonónico.', NULL, 0),
(16, 'LA MUJER ALTA', 'PEDRO ANTONIO DE ALARCON', 1, 1, 10000147, 0, 'Terror / Fantástico', 'Una inquietante historia sobre una aparición recurrente que persigue al protagonista a lo largo de su vida.', NULL, 0),
(17, 'VIAJES ANDALUCES', 'PEDRO ANTONIO DE ALARCON', 1, 1, 10000171, 0, 'Literatura de viajes', 'Crónicas detalladas y pintorescas de los recorridos del autor por las tierras del sur de España.', NULL, 0),
(18, 'MUJERCITAS', 'LOUISA MAY ALCOTT', 1, 1, 10000195, 0, 'Novela de aprendizaje', 'Las vivencias de las hermanas March mientras crecen y buscan su lugar en el mundo durante la Guerra Civil estadounidense.', NULL, 0),
(19, 'DE AMOR Y SOMBRAS', 'ISABEL ALLENDE', 1, 1, 10000219, 0, 'Realismo mágico / Drama', 'Una historia de amor en medio de la violencia política que descubre un terrible secreto oculto por la dictadura.', NULL, 0),
(20, 'CUENTOS DE EVA LUNA', 'ISABEL ALLENDE', 1, 1, 10000243, 0, 'Relato corto', 'Antología de cuentos que mezclan pasión, magia y crítica social narrados por la inolvidable Eva Luna.', NULL, 0),
(21, 'HIJAS DE LA FORTUNA', 'ISABEL ALLENDE', 1, 1, 10000267, 0, 'Novela histórica', 'La odisea de una joven chilena que viaja a California durante la fiebre del oro en busca de su amante.', NULL, 0),
(22, 'PAULA', 'ISABEL ALLENDE', 1, 1, 10000291, 0, 'Autobiografía / Memorias', 'Relato conmovedor escrito por la autora a su hija en coma, recorriendo la historia de su familia y de su país.', NULL, 0),
(23, 'LA CASA DE LOS ESPIRITUS', 'ISABEL ALLENDE', 1, 1, 10000315, 0, 'Realismo mágico', 'La saga familiar de los Trueba, donde los lazos de amor y odio se entrelazan con el destino de una nación.', NULL, 0),
(24, 'RETRATO EN SEPIA', 'ISABEL ALLENDE', 1, 1, 10000339, 0, 'Novela histórica', 'Una historia sobre la memoria y los secretos familiares que transcurre entre San Francisco y el Chile del siglo XIX.', NULL, 0),
(25, 'NOMBRE DE GUERRERA', 'JOSÉ DE ALMADA NEGREIROS', 1, 1, 10000363, 0, 'Ficción / Vanguardismo', 'Una obra innovadora que explora la identidad y la lucha interna a través de una prosa vibrante y simbólica.', NULL, 0),
(26, 'INÉS DEL ALMA MÍA', 'ISABEL ALLENDE', 1, 1, 10000387, 0, 'Novela histórica', 'La vida de Inés Suárez, la mujer que acompañó a Pedro de Valdivia en la conquista y fundación de Chile.', NULL, 0);
