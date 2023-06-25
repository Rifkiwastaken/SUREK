-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 25, 2023 at 11:05 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tb_pweb_a`
--

-- --------------------------------------------------------

--
-- Table structure for table `forms`
--

CREATE TABLE `forms` (
  `form_id` int(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `forms`
--

INSERT INTO `forms` (`form_id`, `user_id`, `title`, `description`, `created_at`, `updated_at`) VALUES
(1, '11', 'pweb', 'disini', '2023-06-25 04:55:08.000000', '0000-00-00 00:00:00.000000'),
(2, '12', 'pweb', 'disini', '2023-06-25 05:13:37.000000', '0000-00-00 00:00:00.000000'),
(3, '12', 'data mining', 'DBSCAN', '2023-06-25 05:34:58.000000', '0000-00-00 00:00:00.000000'),
(4, '12', 'RPL', 'tugas dsinii', '2023-06-25 06:00:25.000000', '0000-00-00 00:00:00.000000'),
(5, '12', 'spk', 'disni', '2023-06-25 06:00:40.000000', '0000-00-00 00:00:00.000000');

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `user_id` varchar(255) NOT NULL,
  `form_id` varchar(255) NOT NULL,
  `uploaded_file` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`user_id`, `form_id`, `uploaded_file`, `description`, `created_at`, `updated_at`) VALUES
('11', '1', 'uploaded_file-1687669178325-816926401.pdf', 'alvino albas', '2023-06-25 04:59:38.000000', '0000-00-00 00:00:00.000000'),
('12', '2', 'uploaded_file-1687670108760-928461566.pdf', 'nim nama', '2023-06-25 05:15:08.000000', '0000-00-00 00:00:00.000000'),
('12', '3', 'uploaded_file-1687671318141-454720360.pdf', 'DBSCAN', '2023-06-25 05:35:18.000000', '0000-00-00 00:00:00.000000');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `active` int(2) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `active`, `avatar`, `created_at`, `updated_at`) VALUES
(7, 'admin', 'admin@ex.com', 'admin', 0, '', '2023-06-07 15:17:15.000000', '2023-06-07 15:17:15.796000'),
(8, 'contoh', 'contoh@ex.com', 'admin', 0, '', '2023-06-07 15:38:33.000000', '2023-06-07 15:38:33.728000'),
(9, 'vino', '', '$2b$10$/rqyTPUu.Qm9/2fXPK9gHu.UV7xgemdNc96jmK89aXbV2ONCRQf8O', 0, '', '2023-06-22 03:37:45.000000', '0000-00-00 00:00:00.000000'),
(10, 'johndoe', '', '$2b$10$m2IUEmAn12RCNwnhtbwsXeKT8yYU2Zl2/t.Pu6ni9Cpwdkabe7CWq', 0, '', '2023-06-22 03:43:24.000000', '0000-00-00 00:00:00.000000'),
(11, 'qwerty', 'qwerty@gmail.com', '$2b$10$kgka/AiDzodIox7IXjQ3kenoOmQIjV8.EA7tNgJUuGWtcNcdBX9Iu', 0, 'avatar-1687681463260-515278985.jpg', '2023-06-25 08:24:23.272090', '0000-00-00 00:00:00.000000'),
(12, 'ytrewq', 'ytrewq@gmail.com', '$2b$10$AHu998DcugJaYs.Y5sjpze4k.znohUQ86j/GSPwHsA1I8MmHozBGS', 0, 'avatar-1687671749470-416096137.jpeg', '2023-06-25 05:42:29.000000', '0000-00-00 00:00:00.000000');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `forms`
--
ALTER TABLE `forms`
  ADD PRIMARY KEY (`form_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `forms`
--
ALTER TABLE `forms`
  MODIFY `form_id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
