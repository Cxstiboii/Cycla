-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: productos_deportivos
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carrito_items`
--

DROP TABLE IF EXISTS `carrito_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrito_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `carrito_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL,
  `agregado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_carrito_producto` (`carrito_id`,`producto_id`),
  KEY `idx_carrito_id` (`carrito_id`),
  KEY `idx_producto_id` (`producto_id`),
  CONSTRAINT `carrito_items_ibfk_1` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `carrito_items_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrito_items`
--

LOCK TABLES `carrito_items` WRITE;
/*!40000 ALTER TABLE `carrito_items` DISABLE KEYS */;
INSERT INTO `carrito_items` VALUES (2,4,3,1,320.00,'2025-11-03 02:33:55','2025-11-03 02:33:55'),(3,4,4,1,1250.00,'2025-11-03 02:36:57','2025-11-03 02:36:57'),(4,4,39,1,28500.00,'2025-11-03 02:45:39','2025-11-03 02:45:39'),(5,4,9,1,220.00,'2025-11-03 17:22:20','2025-11-03 17:22:20');
/*!40000 ALTER TABLE `carrito_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carritos`
--

DROP TABLE IF EXISTS `carritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario_id` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carritos`
--

LOCK TABLES `carritos` WRITE;
/*!40000 ALTER TABLE `carritos` DISABLE KEYS */;
INSERT INTO `carritos` VALUES (4,0,'2025-11-03 01:47:52','2025-11-03 01:47:52');
/*!40000 ALTER TABLE `carritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre_producto` varchar(100) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `fk_id_vendedor` int(11) NOT NULL,
  `fk_id_tipo_Producto` int(11) NOT NULL,
  `imagen_url` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_id_vendedor` (`fk_id_vendedor`),
  KEY `fk_id_tipo_Producto` (`fk_id_tipo_Producto`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`fk_id_vendedor`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`fk_id_tipo_Producto`) REFERENCES `tipo_producto` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Maillot Profesional Manga Corta',35,580.00,2,1,'/assets/productos/ropa-ciclismo/maillotProfesionaMangaCorta.png'),(2,'Sillin de Competición',42,890.00,3,2,'/assets/productos/partes-ciclismo/sillinDeCompeticion.png'),(3,'Guantes de Ciclismo con Gel',58,320.00,4,1,'/assets/productos/ropa-ciclismo/guantesCiclismoConGel.png'),(4,'Chaqueta Impermeable',27,1250.00,6,1,'/assets/productos/ropa-ciclismo/chaquetaImpermeable.png'),(5,'Medias de Compresión',63,150.00,7,1,'/assets/productos/ropa-ciclismo/mediasDeCompresion.png'),(6,'Casco Aero Profesional',38,1450.00,8,1,'/assets/productos/ropa-ciclismo/cascoAeroProfesional.png'),(7,'Gafas Polarizadas',52,580.00,10,1,'/assets/productos/ropa-ciclismo/gafasPolarizadas.png'),(8,'Luces LED Delanteras 1500lm',45,650.00,14,2,'/assets/productos/partes-ciclismo/lucesLedDelanteras1500lm.png'),(9,'Luces Traseras Intermitentes',71,220.00,15,2,'/assets/productos/partes-ciclismo/lucesTraserasIntermitentes.png'),(10,'Computadora GPS Ciclocomputador',18,3200.00,17,2,'/assets/productos/partes-ciclismo/computadoraGpsCiclocomputador.png'),(11,'Portabidones Carbono',39,180.00,20,2,'/assets/productos/partes-ciclismo/portabidonesCarbono.png'),(12,'Candado en U Reforzado',32,780.00,22,2,'/assets/productos/partes-ciclismo/candadoEnUReforzado.png'),(13,'Bidón Deportivo 750ml',85,95.00,18,2,'/assets/productos/partes-ciclismo/bidonDeportivo.png'),(14,'Mochila Hidratación 3L',26,950.00,23,2,'/assets/productos/partes-ciclismo/mochilaHidratación3L.png'),(15,'Bomba de Mano Mini',47,250.00,25,2,'/assets/productos/partes-ciclismo/bombaDeManoMini.png'),(16,'Multiherramienta 16 Funciones',54,350.00,28,2,'/assets/productos/partes-ciclismo/multiherramienta16Funciones.png'),(17,'Kit de Parches Reparación',69,45.00,30,2,'/assets/productos/partes-ciclismo/kitDeParchesReparación.png'),(18,'Soporte para Teléfono',61,140.00,38,2,'/assets/productos/partes-ciclismo/soporteParaTeléfono.png'),(19,'Espejo Retrovisor',48,75.00,41,2,'/assets/productos/partes-ciclismo/espejoRetrovisor.png'),(20,'Timbre de Bicicleta',77,65.00,45,2,'/assets/productos/partes-ciclismo/timbreDeBicicleta.png'),(21,'Cuadro de Carbono Talla M',14,12500.00,47,2,'/assets/productos/bicicletas/cuadroDeCarbonoTallaM.png'),(22,'Ruedas de Carbono',16,9800.00,48,2,'/assets/productos/bicicletas/ruedasDeCarbono.png'),(23,'Grupo de Cambios Shimano 105',22,4500.00,49,2,'/assets/productos/bicicletas/grupoDeCambiosShimano105.png'),(24,'Frenos de Disco Hidráulicos',28,1850.00,50,2,'/assets/productos/bicicletas/frenosDeDiscoHidráulicos.png'),(25,'Manubrio de Carbono',31,1200.00,2,2,'/assets/productos/partes-ciclismo/manubrioDeCarbono.png'),(26,'Sillín de Competición',44,850.00,3,2,'/assets/productos/partes-ciclismo/sillínDeCompetición.png'),(27,'Pedales Automáticos',39,950.00,4,2,'/assets/productos/partes-ciclismo/pedalesAutomáticos.png'),(28,'Cadena 11 Velocidades',57,420.00,6,2,'/assets/productos/partes-ciclismo/cadena11Velocidades.png'),(29,'Cassette 11-28',46,680.00,7,2,'/assets/productos/partes-ciclismo/cassette11-28.png'),(30,'Palancas de Cambio',33,1200.00,8,2,'/assets/productos/partes-ciclismo/palancasDeCambio.png'),(31,'Frenos de Disco',29,750.00,10,2,'/assets/productos/partes-ciclismo/frenosDeDisco.png'),(32,'Bielas de Carbono',19,2200.00,14,2,'/assets/productos/partes-ciclismo/bielasDeCarbono.png'),(33,'Suspensión Delantera',24,3200.00,15,2,'/assets/productos/partes-ciclismo/suspensiónDelantera.png'),(34,'Cubiertas 700x25c',52,480.00,17,2,'/assets/productos/partes-ciclismo/cubiertas700x25c.png'),(35,'Cámara de Aire Repuesto',68,120.00,18,2,'/assets/productos/partes-ciclismo/cámaraDeAireRepuesto.png'),(36,'Pastillas de Freno',73,110.00,20,2,'/assets/productos/partes-ciclismo/pastillasDeFreno.png'),(37,'Potencia de Aluminio',41,380.00,22,2,'/assets/productos/partes-ciclismo/potenciaDeAluminio.png'),(38,'Tija de Sillín',36,520.00,23,2,'/assets/productos/partes-ciclismo/tijaDeSillín.png'),(39,'Bicicleta de Carretera Carbono',12,28500.00,25,3,'/assets/productos/bicicletas/bicicletaDeCarreteraCarbono.png'),(40,'Bicicleta de Montaña Suspensión',15,19800.00,28,3,'/assets/productos/bicicletas/bicicletaDeMontañaSuspensión.png'),(41,'Bicicleta Eléctrica Urbana',18,22500.00,30,3,'/assets/productos/bicicletas/bicicletaEléctricaUrbana.png'),(42,'Bicicleta Plegable',22,12500.00,38,3,'/assets/productos/bicicletas/bicicletaPlegable.png'),(43,'Bicicleta de Triatlón',9,35000.00,41,3,'/assets/productos/bicicletas/bicicletaDeTriatlón.png'),(44,'Bicicleta de Gravel',16,16800.00,45,3,'/assets/productos/bicicletas/bicicletaDeGravel.png'),(45,'Bicicleta Infantil 20\"',25,3800.00,47,3,'/assets/productos/bicicletas/bicicletaInfantil20.png'),(46,'Bicicleta Fixie Urbana',30,7500.00,48,3,'/assets/productos/bicicletas/bicicletaFixieUrbana.png'),(47,'Bicicleta de Ruta Aluminio',20,12800.00,49,3,'/assets/productos/bicicletas/bicicletaDeRutaAluminio.png'),(48,'Bicicleta de Montaña Rígida',17,9500.00,50,3,'/assets/productos/bicicletas/bicicletaDeMontañaRígida.png'),(49,'Bicicleta de Ciclocross',13,14200.00,2,3,'/assets/productos/bicicletas/bicicletaDeCiclocross.png'),(50,'Bicicleta de Enduro',11,24500.00,3,3,'/assets/productos/bicicletas/bicicletaDeEnduro.png');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_producto`
--

DROP TABLE IF EXISTS `tipo_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_producto` (
  `id` int(11) NOT NULL,
  `Categoria` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_producto`
--

LOCK TABLES `tipo_producto` WRITE;
/*!40000 ALTER TABLE `tipo_producto` DISABLE KEYS */;
INSERT INTO `tipo_producto` VALUES (1,'Ropa Deportiva de Ciclismo'),(2,'Partes de Ciclismo'),(3,'Bicicletas');
/*!40000 ALTER TABLE `tipo_producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `rol` enum('cliente','vendedor') NOT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `password` varchar(100) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (0,'Samuel David Castillo Cuellar','samuelcastillo1007@gmail.com',NULL,'cliente',NULL,'$2b$10$SVnLQsXqpIk8kh2eELwc4Oo./xk9jQ8IQaVmaCAxI1/prgqIrELjG',NULL,'0000-00-00 00:00:00','0000-00-00 00:00:00'),(1,'Usuario1','usuario1@ejemplo.com','3817119683','cliente','2025-10-11 13:26:47','hash10x','yuXcf5jwWD','2025-10-06 13:26:47','2025-10-06 13:26:47'),(2,'Usuario2','usuario2@ejemplo.com','3182584964','vendedor',NULL,'hash13x','tSEn4iQN43','2025-10-13 13:26:47','2025-10-13 13:26:47'),(3,'Usuario3','usuario3@ejemplo.com','3220945744','vendedor','2025-09-28 13:26:47','hash16x','7B1LJZhslm','2025-10-16 13:26:47','2025-10-16 13:26:47'),(4,'Usuario4','usuario4@ejemplo.com','3204555990','vendedor','2025-09-23 13:26:47','hash19x','2ZaLFd98mC','2025-10-13 13:26:47','2025-10-13 13:26:47'),(5,'Usuario5','usuario5@ejemplo.com','3680965632','cliente',NULL,'hash22x','L0slyTaCMs','2025-10-09 13:26:47','2025-10-09 13:26:47'),(6,'Usuario6','usuario6@ejemplo.com','3740338498','vendedor',NULL,'hash25x','2cAqXR5qjv','2025-10-06 13:26:47','2025-10-06 13:26:47'),(7,'Usuario7','usuario7@ejemplo.com','3416601369','vendedor',NULL,'hash28x','MXnYXm3qXb','2025-10-13 13:26:47','2025-10-13 13:26:47'),(8,'Usuario8','usuario8@ejemplo.com','3729307729','vendedor',NULL,'hash31x','3FxxU39RgW','2025-10-11 13:26:47','2025-10-11 13:26:47'),(9,'Usuario9','usuario9@ejemplo.com','3434348117','cliente',NULL,'hash34x','3zbtLfqw0j','2025-10-15 13:26:47','2025-10-15 13:26:47'),(10,'Usuario10','usuario10@ejemplo.com','3748877748','vendedor','2025-10-06 13:26:48','hash37x','spYX0UmKoS','2025-10-12 13:26:47','2025-10-12 13:26:47'),(11,'Usuario11','usuario11@ejemplo.com','3178231007','vendedor',NULL,'hash40x','LZpM11L2oA','2025-10-09 13:26:47','2025-10-09 13:26:47'),(12,'Usuario12','usuario12@ejemplo.com','3056872279','cliente',NULL,'hash43x','B02UzpCHMM','2025-10-16 13:26:47','2025-10-16 13:26:47'),(13,'Usuario13','usuario13@ejemplo.com','3667379785','cliente',NULL,'hash46x','qopSDBFsIE','2025-10-07 13:26:47','2025-10-07 13:26:47'),(14,'Usuario14','usuario14@ejemplo.com','3763055399','vendedor',NULL,'hash49x','pXsWx2JvJt','2025-10-06 13:26:47','2025-10-06 13:26:47'),(15,'Usuario15','usuario15@ejemplo.com','3090248753','vendedor',NULL,'hash52x','j4bVCb8Q9G','2025-10-13 13:26:47','2025-10-13 13:26:47'),(16,'Usuario16','usuario16@ejemplo.com','3971090027','cliente','2025-09-19 13:26:47','hash55x','3nN8Ik73HP','2025-10-06 13:26:47','2025-10-06 13:26:47'),(17,'Usuario17','usuario17@ejemplo.com','3864970369','vendedor',NULL,'hash58x','XLihImQHQ2','2025-10-07 13:26:47','2025-10-07 13:26:47'),(18,'Usuario18','usuario18@ejemplo.com','3441410615','vendedor','2025-09-17 13:26:47','hash61x','vHEivwdloh','2025-10-12 13:26:47','2025-10-12 13:26:47'),(19,'Usuario19','usuario19@ejemplo.com','3488760757','cliente','2025-09-18 13:26:47','hash64x','HAsnOoSOPO','2025-10-06 13:26:47','2025-10-06 13:26:47'),(20,'Usuario20','usuario20@ejemplo.com','3035536838','vendedor',NULL,'hash67x','uWnGQyKOik','2025-10-06 13:26:47','2025-10-06 13:26:47'),(21,'Usuario21','usuario21@ejemplo.com','3497277518','cliente','2025-09-22 13:26:47','hash70x','Jk9vWRULUM','2025-10-13 13:26:47','2025-10-13 13:26:47'),(22,'Usuario22','usuario22@ejemplo.com','3772413340','vendedor',NULL,'hash73x','LLEYzGYQK7','2025-10-14 13:26:47','2025-10-14 13:26:47'),(23,'Usuario23','usuario23@ejemplo.com','3415283357','vendedor',NULL,'hash76x','1Bm0NTleAL','2025-10-16 13:26:47','2025-10-16 13:26:47'),(24,'Usuario24','usuario24@ejemplo.com','3319478839','cliente',NULL,'hash79x','sBHUaODHNp','2025-10-10 13:26:47','2025-10-10 13:26:47'),(25,'Usuario25','usuario25@ejemplo.com','3612866934','vendedor',NULL,'hash82x','TeOvUYnDFj','2025-10-08 13:26:47','2025-10-08 13:26:47'),(26,'Usuario26','usuario26@ejemplo.com','3266283457','cliente','2025-09-19 13:26:47','hash85x','AsASe7RGlA','2025-10-13 13:26:47','2025-10-13 13:26:47'),(27,'Usuario27','usuario27@ejemplo.com','3030666777','cliente','2025-10-12 13:26:47','hash88x','oOakesu8SN','2025-10-15 13:26:47','2025-10-15 13:26:47'),(28,'Usuario28','usuario28@ejemplo.com','3132886249','vendedor','2025-10-02 13:26:47','hash91x','fhfNu9j4hw','2025-10-16 13:26:47','2025-10-16 13:26:47'),(29,'Usuario29','usuario29@ejemplo.com','3804493940','cliente','2025-09-30 13:26:47','hash94x','yehFE83LWc','2025-10-15 13:26:47','2025-10-15 13:26:47'),(30,'Usuario30','usuario30@ejemplo.com','3546123287','vendedor',NULL,'hash97x','SZ5u9J3ZmS','2025-10-07 13:26:47','2025-10-07 13:26:47'),(31,'Usuario31','usuario31@ejemplo.com','3077721915','cliente','2025-10-02 13:26:47','hash100x','Or3FnEUsjW','2025-10-15 13:26:47','2025-10-15 13:26:47'),(32,'Usuario32','usuario32@ejemplo.com','3860803266','cliente','2025-09-18 13:26:47','hash103x','Ch4uBBzO9S','2025-10-14 13:26:47','2025-10-14 13:26:47'),(33,'Usuario33','usuario33@ejemplo.com','3376352957','cliente',NULL,'hash106x','yM9hqokcio','2025-10-15 13:26:47','2025-10-15 13:26:47'),(34,'Usuario34','usuario34@ejemplo.com','3890704612','cliente','2025-10-02 13:26:47','hash109x','Pv9iTTLd5P','2025-10-14 13:26:47','2025-10-14 13:26:47'),(35,'Usuario35','usuario35@ejemplo.com','3295323817','cliente',NULL,'hash112x','ZAu5Sn0nur','2025-10-14 13:26:47','2025-10-14 13:26:47'),(36,'Usuario36','usuario36@ejemplo.com','3927725721','cliente','2025-09-17 13:26:47','hash115x','4m9QvASNQx','2025-10-07 13:26:47','2025-10-07 13:26:47'),(37,'Usuario37','usuario37@ejemplo.com','3521574002','cliente',NULL,'hash118x','wRPtUFHkDm','2025-10-07 13:26:47','2025-10-07 13:26:47'),(38,'Usuario38','usuario38@ejemplo.com','3930096330','vendedor',NULL,'hash121x','SosiuONcOb','2025-10-11 13:26:47','2025-10-11 13:26:47'),(39,'Usuario39','usuario39@ejemplo.com','3250923845','cliente',NULL,'hash124x','z3qdgHFSEc','2025-10-12 13:26:47','2025-10-12 13:26:47'),(40,'Usuario40','usuario40@ejemplo.com','3632567920','cliente','2025-10-09 13:26:47','hash127x','gos4ASK4Up','2025-10-11 13:26:47','2025-10-11 13:26:47'),(41,'Usuario41','usuario41@ejemplo.com','3314357574','vendedor','2025-10-11 13:26:47','hash130x','mMW7pFGwfv','2025-10-16 13:26:47','2025-10-16 13:26:47'),(42,'Usuario42','usuario42@ejemplo.com','3465356597','cliente','2025-09-23 13:26:47','hash133x','8FMEBqzPWZ','2025-10-15 13:26:47','2025-10-15 13:26:47'),(43,'Usuario43','usuario43@ejemplo.com','3029772728','cliente',NULL,'hash136x','FgikzrW9RW','2025-10-14 13:26:47','2025-10-14 13:26:47'),(44,'Usuario44','usuario44@ejemplo.com','3017832685','cliente',NULL,'hash139x','fDxmw6dTUP','2025-10-06 13:26:47','2025-10-06 13:26:47'),(45,'Usuario45','usuario45@ejemplo.com','3066709969','vendedor',NULL,'hash142x','LSwXOJYw1Q','2025-10-11 13:26:47','2025-10-11 13:26:47'),(46,'Usuario46','usuario46@ejemplo.com','3558052424','cliente','2025-10-08 13:26:47','hash145x','2clBr4uDeo','2025-10-14 13:26:47','2025-10-14 13:26:47'),(47,'Usuario47','usuario47@ejemplo.com','3789397597','vendedor','2025-09-19 13:26:47','hash148x','avKv9OCh8l','2025-10-13 13:26:47','2025-10-13 13:26:47'),(48,'Usuario48','usuario48@ejemplo.com','3045481381','vendedor','2025-09-17 13:26:47','hash151x','3o4c4l5M2H','2025-10-09 13:26:47','2025-10-09 13:26:47'),(49,'Usuario49','usuario49@ejemplo.com','3248848365','vendedor',NULL,'hash154x','zRF7p7tdsH','2025-10-13 13:26:47','2025-10-13 13:26:47'),(50,'Usuario50','usuario50@ejemplo.com','3068384689','vendedor',NULL,'hash157x','wKYKCTIaOu','2025-10-16 13:26:47','2025-10-16 13:26:47');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-08 20:20:37
