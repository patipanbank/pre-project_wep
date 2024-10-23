-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 23, 2024 at 01:26 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project_web`
--

-- --------------------------------------------------------

--
-- Table structure for table `data`
--

CREATE TABLE `data` (
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `tel` varchar(255) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `major` varchar(255) DEFAULT NULL,
  `available` varchar(255) NOT NULL DEFAULT 'on',
  `data_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave`
--

CREATE TABLE `leave` (
  `leave_id` int(11) NOT NULL,
  `date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `data_id` int(11) DEFAULT NULL,
  `timeslots_id` int(11) DEFAULT NULL,
  `status` enum('Available','Unavailable','Waiting','Leave','Empty') NOT NULL DEFAULT 'Empty',
  `semester_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `schedules_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `data_id` int(11) DEFAULT NULL,
  `timeslots_id` int(11) DEFAULT NULL,
  `status` enum('Available','Unavailable','Waiting','Leave','Empty') NOT NULL DEFAULT 'Empty',
  `semester_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `semester`
--

CREATE TABLE `semester` (
  `semester_id` int(11) NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `term` enum('1','2','3') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `year` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timeslots`
--

CREATE TABLE `timeslots` (
  `timeslots_id` int(11) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `dayofweek` enum('Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `timeslots`
--

INSERT INTO `timeslots` (`timeslots_id`, `start_time`, `end_time`, `dayofweek`) VALUES
(1, '08:00:00', '08:30:00', 'Monday'),
(2, '08:30:00', '09:00:00', 'Monday'),
(3, '09:00:00', '09:30:00', 'Monday'),
(4, '09:30:00', '10:00:00', 'Monday'),
(5, '10:00:00', '10:30:00', 'Monday'),
(6, '10:30:00', '11:00:00', 'Monday'),
(7, '11:00:00', '11:30:00', 'Monday'),
(8, '11:30:00', '12:00:00', 'Monday'),
(9, '12:00:00', '12:30:00', 'Monday'),
(10, '12:30:00', '13:00:00', 'Monday'),
(11, '13:00:00', '13:30:00', 'Monday'),
(12, '13:30:00', '14:00:00', 'Monday'),
(13, '14:00:00', '14:30:00', 'Monday'),
(14, '14:30:00', '15:00:00', 'Monday'),
(15, '15:00:00', '15:30:00', 'Monday'),
(16, '15:30:00', '16:00:00', 'Monday'),
(17, '16:00:00', '16:30:00', 'Monday'),
(18, '16:30:00', '17:00:00', 'Monday'),
(19, '08:00:00', '08:30:00', 'Tuesday'),
(20, '08:30:00', '09:00:00', 'Tuesday'),
(21, '09:00:00', '09:30:00', 'Tuesday'),
(22, '09:30:00', '10:00:00', 'Tuesday'),
(23, '10:00:00', '10:30:00', 'Tuesday'),
(24, '10:30:00', '11:00:00', 'Tuesday'),
(25, '11:00:00', '11:30:00', 'Tuesday'),
(26, '11:30:00', '12:00:00', 'Tuesday'),
(27, '12:00:00', '12:30:00', 'Tuesday'),
(28, '12:30:00', '13:00:00', 'Tuesday'),
(29, '13:00:00', '13:30:00', 'Tuesday'),
(30, '13:30:00', '14:00:00', 'Tuesday'),
(31, '14:00:00', '14:30:00', 'Tuesday'),
(32, '14:30:00', '15:00:00', 'Tuesday'),
(33, '15:00:00', '15:30:00', 'Tuesday'),
(34, '15:30:00', '16:00:00', 'Tuesday'),
(35, '16:00:00', '16:30:00', 'Tuesday'),
(36, '16:30:00', '17:00:00', 'Tuesday'),
(37, '08:00:00', '08:30:00', 'Wednesday'),
(38, '08:30:00', '09:00:00', 'Wednesday'),
(39, '09:00:00', '09:30:00', 'Wednesday'),
(40, '09:30:00', '10:00:00', 'Wednesday'),
(41, '10:00:00', '10:30:00', 'Wednesday'),
(42, '10:30:00', '11:00:00', 'Wednesday'),
(43, '11:00:00', '11:30:00', 'Wednesday'),
(44, '11:30:00', '12:00:00', 'Wednesday'),
(45, '12:00:00', '12:30:00', 'Wednesday'),
(46, '12:30:00', '13:00:00', 'Wednesday'),
(47, '13:00:00', '13:30:00', 'Wednesday'),
(48, '13:30:00', '14:00:00', 'Wednesday'),
(49, '14:00:00', '14:30:00', 'Wednesday'),
(50, '14:30:00', '15:00:00', 'Wednesday'),
(51, '15:00:00', '15:30:00', 'Wednesday'),
(52, '15:30:00', '16:00:00', 'Wednesday'),
(53, '16:00:00', '16:30:00', 'Wednesday'),
(54, '16:30:00', '17:00:00', 'Wednesday'),
(55, '08:00:00', '08:30:00', 'Thursday'),
(56, '08:30:00', '09:00:00', 'Thursday'),
(57, '09:00:00', '09:30:00', 'Thursday'),
(58, '09:30:00', '10:00:00', 'Thursday'),
(59, '10:00:00', '10:30:00', 'Thursday'),
(60, '10:30:00', '11:00:00', 'Thursday'),
(61, '11:00:00', '11:30:00', 'Thursday'),
(62, '11:30:00', '12:00:00', 'Thursday'),
(63, '12:00:00', '12:30:00', 'Thursday'),
(64, '12:30:00', '13:00:00', 'Thursday'),
(65, '13:00:00', '13:30:00', 'Thursday'),
(66, '13:30:00', '14:00:00', 'Thursday'),
(67, '14:00:00', '14:30:00', 'Thursday'),
(68, '14:30:00', '15:00:00', 'Thursday'),
(69, '15:00:00', '15:30:00', 'Thursday'),
(70, '15:30:00', '16:00:00', 'Thursday'),
(71, '16:00:00', '16:30:00', 'Thursday'),
(72, '16:30:00', '17:00:00', 'Thursday'),
(73, '08:00:00', '08:30:00', 'Friday'),
(74, '08:30:00', '09:00:00', 'Friday'),
(75, '09:00:00', '09:30:00', 'Friday'),
(76, '09:30:00', '10:00:00', 'Friday'),
(77, '10:00:00', '10:30:00', 'Friday'),
(78, '10:30:00', '11:00:00', 'Friday'),
(79, '11:00:00', '11:30:00', 'Friday'),
(80, '11:30:00', '12:00:00', 'Friday'),
(81, '12:00:00', '12:30:00', 'Friday'),
(82, '12:30:00', '13:00:00', 'Friday'),
(83, '13:00:00', '13:30:00', 'Friday'),
(84, '13:30:00', '14:00:00', 'Friday'),
(85, '14:00:00', '14:30:00', 'Friday'),
(86, '14:30:00', '15:00:00', 'Friday'),
(87, '15:00:00', '15:30:00', 'Friday'),
(88, '15:30:00', '16:00:00', 'Friday'),
(89, '16:00:00', '16:30:00', 'Friday'),
(90, '16:30:00', '17:00:00', 'Friday');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `users_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` tinyint(4) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `data`
--
ALTER TABLE `data`
  ADD PRIMARY KEY (`data_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`);

--
-- Indexes for table `leave`
--
ALTER TABLE `leave`
  ADD PRIMARY KEY (`leave_id`),
  ADD KEY `data_id` (`data_id`),
  ADD KEY `timeslots_id` (`timeslots_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`schedules_id`),
  ADD KEY `data_id` (`data_id`),
  ADD KEY `timeslots_id` (`timeslots_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `semester`
--
ALTER TABLE `semester`
  ADD PRIMARY KEY (`semester_id`);

--
-- Indexes for table `timeslots`
--
ALTER TABLE `timeslots`
  ADD PRIMARY KEY (`timeslots_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`users_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`),
  ADD UNIQUE KEY `email_54` (`email`),
  ADD UNIQUE KEY `email_55` (`email`),
  ADD UNIQUE KEY `email_56` (`email`),
  ADD UNIQUE KEY `email_57` (`email`),
  ADD UNIQUE KEY `email_58` (`email`),
  ADD UNIQUE KEY `email_59` (`email`),
  ADD UNIQUE KEY `email_60` (`email`),
  ADD UNIQUE KEY `email_61` (`email`),
  ADD UNIQUE KEY `email_62` (`email`),
  ADD UNIQUE KEY `email_63` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `data`
--
ALTER TABLE `data`
  MODIFY `data_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `leave`
--
ALTER TABLE `leave`
  MODIFY `leave_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedules_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16277;

--
-- AUTO_INCREMENT for table `semester`
--
ALTER TABLE `semester`
  MODIFY `semester_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `timeslots`
--
ALTER TABLE `timeslots`
  MODIFY `timeslots_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `users_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_273` FOREIGN KEY (`data_id`) REFERENCES `data` (`data_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_274` FOREIGN KEY (`timeslots_id`) REFERENCES `timeslots` (`timeslots_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
