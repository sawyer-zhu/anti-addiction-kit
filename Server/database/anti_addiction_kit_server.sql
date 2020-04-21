-- phpMyAdmin SQL Dump
-- version 4.4.14
-- http://www.phpmyadmin.net
--
-- Host: 172.26.1.2
-- Generation Time: 2020-04-08 06:08:24
-- 服务器版本： 5.6.39-log
-- PHP Version: 7.2.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `anti_addiction_kit_server`
--

-- --------------------------------------------------------

--
-- 表的结构 `charge_amounts`
--

CREATE TABLE IF NOT EXISTS `charge_amounts` (
  `id` int(11) unsigned NOT NULL,
  `charge_key` varchar(255) NOT NULL COMMENT '累计充值金额key，身份证或者账号',
  `amount` int(3) unsigned NOT NULL DEFAULT '0' COMMENT '金额',
  `month` varchar(20) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `switchs`
--

CREATE TABLE IF NOT EXISTS `switchs` (
  `id` int(10) unsigned NOT NULL,
  `use_time_switch` int(3) unsigned NOT NULL DEFAULT '0' COMMENT '默认0，ps 0 ：使用客户端时间，1：使用服务器时间',
  `night_ban_time_start` varchar(10) NOT NULL DEFAULT '22:00' COMMENT '宵禁开始时间',
  `night_ban_time_end` varchar(10) NOT NULL DEFAULT '08:00' COMMENT '宵禁结束时间',
  `shiming_user_duration` int(3) unsigned NOT NULL DEFAULT '5400' COMMENT '实名未成年账号时长',
  `no_shiming_user_duration` int(11) NOT NULL DEFAULT '3600' COMMENT '未实名游戏时长',
  `shiming_user_holiday_duration` int(3) unsigned NOT NULL DEFAULT '10800' COMMENT '实名未成年账号节假日时长',
  `teen_pay_limit` int(3) unsigned NOT NULL DEFAULT '5000' COMMENT '8-15岁单笔付费限额，单位：分',
  `teen_month_pay_limit` int(3) unsigned NOT NULL DEFAULT '20000' COMMENT '8-15岁月付费限额，单位：分',
  `young_pay_limit` int(3) unsigned NOT NULL DEFAULT '10000' COMMENT '16-17岁单笔付费限额，单位：分',
  `young_month_pay_limit` int(3) unsigned NOT NULL DEFAULT '40000' COMMENT '16-17 月付费限额，单位：分',
  `holiday_dates` text NOT NULL COMMENT '每年的法定节假日json',
  `version` varchar(20) NOT NULL COMMENT '版本'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `user_info`
--

CREATE TABLE IF NOT EXISTS `user_info` (
  `id` int(11) unsigned NOT NULL,
  `user_id` varchar(255) NOT NULL COMMENT '用户 ID',
  `identify_state` int(1) unsigned NOT NULL COMMENT '实名状态，0=>未实名，1=>实名,2=>第三方实名',
  `identify` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `account_type` int(1) unsigned NOT NULL DEFAULT '0' COMMENT '第三方实名类型，默认0，非第三方实名， 1  =8岁以下 ，2  =8-15岁，  3 =16-17岁， 4 =18+',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `user_play_durations`
--

CREATE TABLE IF NOT EXISTS `user_play_durations` (
  `id` int(10) unsigned NOT NULL,
  `day` varchar(10) NOT NULL,
  `duration` int(3) unsigned NOT NULL,
  `duration_key` varchar(255) NOT NULL,
  `last_timestamp` int(11) unsigned NOT NULL COMMENT '最后一次游戏时间',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `charge_amounts`
--
ALTER TABLE `charge_amounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identify` (`charge_key`,`month`),
  ADD KEY `month` (`month`) USING BTREE;

--
-- Indexes for table `switchs`
--
ALTER TABLE `switchs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_info`
--
ALTER TABLE `user_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `create_time` (`create_time`),
  ADD KEY `identify` (`identify`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `user_play_durations`
--
ALTER TABLE `user_play_durations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `day` (`day`,`duration_key`) USING BTREE,
  ADD KEY `duration_key` (`duration_key`),
  ADD KEY `last_timestamp` (`last_timestamp`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `charge_amounts`
--
ALTER TABLE `charge_amounts`
  MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `switchs`
--
ALTER TABLE `switchs`
  MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user_info`
--
ALTER TABLE `user_info`
  MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user_play_durations`
--
ALTER TABLE `user_play_durations`
  MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
