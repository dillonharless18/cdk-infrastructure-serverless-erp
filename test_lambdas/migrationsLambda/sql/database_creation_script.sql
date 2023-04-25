CREATE TABLE `user` 

( 

 `user_id`         varchar(32) NOT NULL , 

 `is_active`       binary NOT NULL , 

 `first_name`      varchar(20) NOT NULL , 

 `last_name`       varchar(20) NOT NULL , 

 `phone_number`    varchar(15) NOT NULL , 

 `created_at`      datetime NOT NULL , 

 `last_updated_at` datetime NOT NULL , 

 `ocr_tool_id`     varchar(45) NOT NULL , 

 `user_role`       varchar(20) NOT NULL , 

 `user_email`      varchar(45) NOT NULL , 

 

PRIMARY KEY (`user_id`) 

) COMMENT='id = UUID'; 

CREATE TABLE `vendor` 

( 

 `vendor_id`       int NOT NULL AUTO_INCREMENT , 

 `vendor_name`     varchar(30) NOT NULL , 

 `is_active`       binary NOT NULL , 

 `created_by`      varchar(32) NOT NULL , 

 `last_updated_by` varchar(32) NOT NULL , 

 `created_at`      datetime NOT NULL , 

 `last_update_at`  datetime NOT NULL , 

 `is_net_vendor`   binary NOT NULL , 

 

PRIMARY KEY (`vendor_id`), 

KEY `FK_2` (`last_updated_by`), 

CONSTRAINT `FK_135` FOREIGN KEY `FK_2` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_136` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = vendor name'; 

 

CREATE TABLE `vehicle_type` 

( 

 `vehicle_type_id`   int NOT NULL AUTO_INCREMENT , 

 `vehicle_type_name` varchar(30) NOT NULL , 

 `is_active`         binary NOT NULL , 

 `created_by`        varchar(32) NOT NULL , 

 `last_updated_by`   varchar(32) NOT NULL , 

 `created_at`        datetime NOT NULL , 

 `last_updated_at`   datetime NOT NULL , 

 

PRIMARY KEY (`vehicle_type_id`), 

KEY `FK_2` (`last_updated_by`), 

CONSTRAINT `FK_150` FOREIGN KEY `FK_2` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_151` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = vehicle type name'; 

 

CREATE TABLE `urgent_order_status` 

( 

 `urgent_order_status_id`   int NOT NULL AUTO_INCREMENT , 

 `urgent_order_status_name` varchar(25) NOT NULL , 

 `is_active`                binary NOT NULL , 

 `create_by`                varchar(32) NOT NULL , 

 `last_updated_by`          varchar(32) NOT NULL , 

 `created_at`               datetime NOT NULL , 

 `last_updated_at`          datetime NOT NULL , 

 

PRIMARY KEY (`urgent_order_status_id`), 

KEY `FK_2` (`last_updated_by`), 

CONSTRAINT `FK_145` FOREIGN KEY `FK_2` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`create_by`), 

CONSTRAINT `FK_146` FOREIGN KEY `FK_3` (`create_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = status name'; 

 

CREATE TABLE `transportation_trip_status` 

( 

 `transportation_trip_status_id`   int NOT NULL AUTO_INCREMENT , 

 `transportation_trip_status_name` varchar(30) NOT NULL , 

 `is_active`                       binary NOT NULL , 

 `last_updated_by`                 varchar(32) NOT NULL , 

 `created_by`                      varchar(32) NOT NULL , 

 `created_at`                      datetime NOT NULL , 

 `last_updated_at`                 datetime NOT NULL , 

 

PRIMARY KEY (`transportation_trip_status_id`), 

KEY `FK_2` (`created_by`), 

CONSTRAINT `FK_148_1` FOREIGN KEY `FK_2` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`last_updated_by`), 

CONSTRAINT `FK_149` FOREIGN KEY `FK_3` (`last_updated_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = status name'; 

 

CREATE TABLE `transportation_request_type` 

( 

 `transportation_request_type_id` varchar(25) NOT NULL , 

 `is_active`                      binary NOT NULL , 

 `created_by`                     varchar(32) NOT NULL , 

 `last_updated_by`                varchar(32) NOT NULL , 

 `created_at`                     datetime NOT NULL , 

 `last_updated_at`                datetime NOT NULL , 

 

PRIMARY KEY (`transportation_request_type_id`), 

KEY `FK_2` (`last_updated_by`), 

CONSTRAINT `FK_152` FOREIGN KEY `FK_2` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_153` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = transportation request type name'; 

 

CREATE TABLE `transportation_request_status` 

( 

 `transportation_request_status_id`   int NOT NULL AUTO_INCREMENT , 

 `transportation_request_status_name` varchar(25) NOT NULL , 

 `is_active`                          binary NOT NULL , 

 `created_by`                         varchar(32) NOT NULL , 

 `last_updated_by`                    varchar(32) NOT NULL , 

 `created_at`                         datetime NOT NULL , 

 `last_updated_at`                    datetime NOT NULL , 

 

PRIMARY KEY (`transportation_request_status_id`), 

KEY `FK_2` (`last_updated_by`), 

CONSTRAINT `FK_131_2` FOREIGN KEY `FK_2` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_132` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = transportation request status name'; 

 

CREATE TABLE `purchase_order_status` 

( 

 `purchase_order_status_id`   int NOT NULL AUTO_INCREMENT , 

 `purchase_order_status_name` varchar(25) NOT NULL , 

 `created_by`                 varchar(32) NOT NULL , 

 `last_updated_by`            varchar(32) NOT NULL , 

 `created_at`                 datetime NOT NULL , 

 `last_updated_at`            datetime NOT NULL , 

 

PRIMARY KEY (`purchase_order_status_id`), 

KEY `FK_2` (`created_by`), 

CONSTRAINT `FK_154` FOREIGN KEY `FK_2` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`last_updated_by`), 

CONSTRAINT `FK_155` FOREIGN KEY `FK_3` (`last_updated_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = status name'; 
 

CREATE TABLE `purchase_order_request_item_status` 

( 

 `purchase_order_request_item_status_id`   int NOT NULL AUTO_INCREMENT , 

 `purchase_order_request_item_status_name` varchar(25) NOT NULL , 

 `is_active`                               binary NOT NULL , 

 `created_by`                              varchar(32) NOT NULL , 

 `last_updated_by`                         varchar(32) NOT NULL , 

 `created_at`                              datetime NOT NULL , 

 `last_updated_at`                         datetime NOT NULL , 

 

PRIMARY KEY (`purchase_order_request_item_status_id`), 

KEY `FK_2` (`last_updated_by`), 

CONSTRAINT `FK_147` FOREIGN KEY `FK_2` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_148` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = status name'; 


CREATE TABLE `purchase_order_item_status` 

( 

 `purchase_order_item_status_id`   int NOT NULL AUTO_INCREMENT , 

 `purchase_order_item_status_name` varchar(30) NOT NULL , 

 `is_active`                       binary NOT NULL , 

 `created_by`                      varchar(32) NOT NULL , 

 `last_updated_by`                 varchar(32) NOT NULL , 

 `created_at`                      datetime NOT NULL , 

 `last_updated_at`                 datetime NOT NULL , 

 

PRIMARY KEY (`purchase_order_item_status_id`), 

KEY `FK_2` (`last_updated_by`), 

CONSTRAINT `FK_141` FOREIGN KEY `FK_2` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_142` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = status name'; 

 

 

 

 

 

 


 

CREATE TABLE `project` 

( 

 `project_id`      int NOT NULL AUTO_INCREMENT , 

 `project_name`    varchar(30) NOT NULL , 

 `is_active`       binary NOT NULL , 

 `created_by`      varchar(32) NOT NULL , 

 `last_updated_by` varchar(32) NOT NULL , 

 `created_at`      datetime NOT NULL , 

 `last_updated_at` datetime NOT NULL , 

 `project_code`    varchar(4) NOT NULL , 

 

PRIMARY KEY (`project_id`), 

KEY `FK_2` (`last_updated_by`), 

CONSTRAINT `FK_143` FOREIGN KEY `FK_2` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_144` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = project name'; 

 

 

 

 

 

 


 

CREATE TABLE `credit_card` 

( 

 `credit_card_id`               int NOT NULL AUTO_INCREMENT , 

 `is_active`                    binary NOT NULL , 

 `created_by`                   varchar(32) NOT NULL , 

 `last_updated_by`              varchar(32) NOT NULL , 

 `created_at`                   datetime NOT NULL , 

 `last_updated_at`              datetime NOT NULL , 

 `credit_card_last_four_digits` varchar(4) NOT NULL , 

 `credit_card_name`             varchar(10) NOT NULL , 

 

PRIMARY KEY (`credit_card_id`), 

KEY `FK_2` (`last_updated_by`), 

CONSTRAINT `FK_139` FOREIGN KEY `FK_2` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_140` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = full credit card number (we''ll encrypt this and only ever return the last 4 to the user)'; 

 

 

 
-------------------------------------
 

 

 


 

CREATE TABLE `transportation_trip` 

( 

 `transportation_trip_id`        varchar(32) NOT NULL , 

 `driver_id`                     varchar(32) NOT NULL , 

 `created_by`                    varchar(32) NOT NULL , 

 `last_updated_by`               varchar(32) NOT NULL , 

 `created_at`                    datetime NOT NULL , 

 `last_updated_at`               datetime NOT NULL , 

 `trip_name`                     varchar(45) NOT NULL , 

 `transportation_trip_status_id` int NOT NULL , 

 `vehicle_type_id`               int NOT NULL , 

 

PRIMARY KEY (`transportation_trip_id`), 

KEY `FK_5` (`driver_id`), 

CONSTRAINT `FK_115` FOREIGN KEY `FK_5` (`driver_id`) REFERENCES `user` (`user_id`), 

KEY `FK_5_1` (`last_updated_by`), 

CONSTRAINT `FK_156` FOREIGN KEY `FK_5_1` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_6` (`created_by`), 

CONSTRAINT `FK_157` FOREIGN KEY `FK_6` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_6_1` (`transportation_trip_status_id`), 

CONSTRAINT `FK_20` FOREIGN KEY `FK_6_1` (`transportation_trip_status_id`) REFERENCES `transportation_trip_status` (`transportation_trip_status_id`), 

KEY `FK_6_2` (`vehicle_type_id`), 

CONSTRAINT `FK_18` FOREIGN KEY `FK_6_2` (`vehicle_type_id`) REFERENCES `vehicle_type` (`vehicle_type_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 

 

 

 

 

 


 

CREATE TABLE `purchase_order_request_item` 

( 

 `purchase_order_request_item_id`        varchar(32) NOT NULL , 

 `last_updated_by`                       varchar(32) NOT NULL , 

 `created_by`                            varchar(32) NOT NULL , 

 `item_name`                             varchar(45) NOT NULL , 

 `quantity`                              varchar(45) NOT NULL , 

 `unit_of_measure`                       varchar(15) NOT NULL , 

 `suggested_vendor`                      varchar(30) NOT NULL , 

 `s3_uri`                                varchar(255) NOT NULL , 

 `description`                           varchar(65) NOT NULL , 

 `created_at`                            datetime NOT NULL , 

 `last_updated_at`                       datetime NOT NULL , 

 `price`                                 varchar(15) NOT NULL , 

 `vendor_id`                             int NOT NULL , 

 `project_id`                            int NOT NULL , 

 `purchase_order_request_item_status_id` int NOT NULL , 

 `urgent_order_status_id`                int NOT NULL , 

 

PRIMARY KEY (`purchase_order_request_item_id`), 

KEY `FK_5` (`created_by`), 

CONSTRAINT `FK_112` FOREIGN KEY `FK_5` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_6` (`last_updated_by`), 

CONSTRAINT `FK_126` FOREIGN KEY `FK_6` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_7` (`vendor_id`), 

CONSTRAINT `FK_159_5` FOREIGN KEY `FK_7` (`vendor_id`) REFERENCES `vendor` (`vendor_id`), 

KEY `FK_7_1` (`project_id`), 

CONSTRAINT `FK_23` FOREIGN KEY `FK_7_1` (`project_id`) REFERENCES `project` (`project_id`), 

KEY `FK_7_2` (`purchase_order_request_item_status_id`), 

CONSTRAINT `FK_32` FOREIGN KEY `FK_7_2` (`purchase_order_request_item_status_id`) REFERENCES `purchase_order_request_item_status` (`purchase_order_request_item_status_id`), 

KEY `FK_7_3` (`urgent_order_status_id`), 

CONSTRAINT `FK_24` FOREIGN KEY `FK_7_3` (`urgent_order_status_id`) REFERENCES `urgent_order_status` (`urgent_order_status_id`) 

) COMMENT='PK = 32 Byte character UUID 

 

vendor_id needs to be associated with a default value'; 

 

 

 

 

 

 


 

CREATE TABLE `purchase_order` 

( 

 `purchase_order_id`            varchar(32) NOT NULL , 

 `created_by`                   varchar(32) NOT NULL , 

 `last_updated_by`              varchar(32) NOT NULL , 

 `created_at`                   datetime NOT NULL , 

 `last_updated_at`              datetime NOT NULL , 

 `total_price`                  varchar(20) NOT NULL , 

 `purchase_order_number`        varchar(45) NOT NULL , 

 `vendor_id`                    int NOT NULL , 

 `purchase_order_status_id`     int NOT NULL , 

 `quickbooks_purchase_order_id` varchar(45) NOT NULL , 

 `s3_uri`                       varchar(255) NOT NULL , 

 

PRIMARY KEY (`purchase_order_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_120` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_4` (`last_updated_by`), 

CONSTRAINT `FK_160` FOREIGN KEY `FK_4` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_5` (`vendor_id`), 

CONSTRAINT `FK_161` FOREIGN KEY `FK_5` (`vendor_id`) REFERENCES `vendor` (`vendor_id`), 

KEY `FK_5_1` (`purchase_order_status_id`), 

CONSTRAINT `FK_8` FOREIGN KEY `FK_5_1` (`purchase_order_status_id`) REFERENCES `purchase_order_status` (`purchase_order_status_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 

 

 

 

 

 


 

CREATE TABLE `ocr_imported_purchase_order_draft` 

( 

 `ocr_imported_purchase_order_draft_id` varchar(32) NOT NULL , 

 `created_by`                           varchar(32) NOT NULL , 

 `vendor_id`                            int NOT NULL , 

 `last_updated_by`                      varchar(32) NOT NULL , 

 `created_at`                           datetime NOT NULL , 

 `last_updated_at`                      datetime NOT NULL , 

 `ocr_suggested_vendor`                 varchar(45) NOT NULL , 

 `ocr_suggesetd_purchase_order_number`  varchar(45) NOT NULL , 

 `s3_uri`                               varchar(255) NOT NULL , 

 `credit_card_id`                       int NOT NULL , 

 

PRIMARY KEY (`ocr_imported_purchase_order_draft_id`), 

KEY `FK_2` (`created_by`), 

CONSTRAINT `FK_122_1` FOREIGN KEY `FK_2` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3` (`last_updated_by`), 

CONSTRAINT `FK_123_1` FOREIGN KEY `FK_3` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_4` (`credit_card_id`), 

CONSTRAINT `FK_131_1` FOREIGN KEY `FK_4` (`credit_card_id`) REFERENCES `credit_card` (`credit_card_id`), 

KEY `FK_5` (`vendor_id`), 

CONSTRAINT `FK_162_1` FOREIGN KEY `FK_5` (`vendor_id`) REFERENCES `vendor` (`vendor_id`) 

) COMMENT='PK = 32 Byte character UUID 

 

credit_card_last_four_digits and credit_card_name and vendor_id need a default value'; 

 

 

 

 

 

 


 

CREATE TABLE `item_transportation_request` 

( 

 `item_transportation_request_id`   varchar(32) NOT NULL , 

 `last_updated_by`                  varchar(32) NOT NULL , 

 `transportation_request_type_id`   varchar(25) NOT NULL , 

 `created_by`                       varchar(32) NOT NULL , 

 `item_name`                        varchar(45) NOT NULL , 

 `from_location`                    varchar(100) NOT NULL , 

 `to_location`                      varchar(100) NOT NULL , 

 `recipients`                       varchar(100) NOT NULL , 

 `contact_number`                   varchar(17) NOT NULL , 

 `contact_name`                     varchar(30) NOT NULL , 

 `created_at`                       datetime NOT NULL , 

 `last_updated_at`                  datetime NOT NULL , 

 `additional_details`               varchar(100) NOT NULL , 

 `future_transportation_date`       date NOT NULL , 

 `future_transportation_time`       time NOT NULL , 

 `project_id`                       int NOT NULL , 

 `urgent_order_status_id`           int NOT NULL , 

 `transportation_request_status_id` int NOT NULL , 

 

PRIMARY KEY (`item_transportation_request_id`), 

KEY `FK_5` (`created_by`), 

CONSTRAINT `FK_113` FOREIGN KEY `FK_5` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_6` (`transportation_request_type_id`), 

CONSTRAINT `FK_127_1` FOREIGN KEY `FK_6` (`transportation_request_type_id`) REFERENCES `transportation_request_type` (`transportation_request_type_id`), 

KEY `FK_7` (`last_updated_by`), 

CONSTRAINT `FK_130_1` FOREIGN KEY `FK_7` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_7_1` (`urgent_order_status_id`), 

CONSTRAINT `FK_12` FOREIGN KEY `FK_7_1` (`urgent_order_status_id`) REFERENCES `urgent_order_status` (`urgent_order_status_id`), 

KEY `FK_7_2` (`project_id`), 

CONSTRAINT `FK_7` FOREIGN KEY `FK_7_2` (`project_id`) REFERENCES `project` (`project_id`), 

KEY `FK_7_3` (`transportation_request_status_id`), 

CONSTRAINT `FK_13` FOREIGN KEY `FK_7_3` (`transportation_request_status_id`) REFERENCES `transportation_request_status` (`transportation_request_status_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 

 

 

 

 

 


 

CREATE TABLE `transportation_trip_comment` 

( 

 `transportation_trip_comment_id` varchar(32) NOT NULL , 

 `transportation_trip_id`         varchar(32) NOT NULL , 

 `created_by`                     varchar(32) NOT NULL , 

 `created_at`                     datetime NOT NULL , 

 `comment_text`                   varchar(100) NOT NULL , 

 

PRIMARY KEY (`transportation_trip_comment_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_115_1` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3_1` (`transportation_trip_id`), 

CONSTRAINT `FK_151_1` FOREIGN KEY `FK_3_1` (`transportation_trip_id`) REFERENCES `transportation_trip` (`transportation_trip_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 

 

 

 

 

 


 

CREATE TABLE `transportation_trip_by_item_transportation_request` 

( 

 `item_transportation_request_id`   varchar(32) NOT NULL , 

 `transportation_trip_id`           varchar(32) NOT NULL , 

 `transportation_request_status_id` int NOT NULL , 

 `last_updated_by`                  varchar(32) NOT NULL , 

 `created_by`                       varchar(32) NOT NULL , 

 `created_at`                       datetime NOT NULL , 

 `last_updated_at`                  datetime NOT NULL , 

 

PRIMARY KEY (`item_transportation_request_id`, `transportation_trip_id`), 

KEY `FK_2` (`transportation_trip_id`), 

CONSTRAINT `FK_159_3` FOREIGN KEY `FK_2` (`transportation_trip_id`) REFERENCES `transportation_trip` (`transportation_trip_id`), 

KEY `FK_3` (`item_transportation_request_id`), 

CONSTRAINT `FK_159_2` FOREIGN KEY `FK_3` (`item_transportation_request_id`) REFERENCES `item_transportation_request` (`item_transportation_request_id`), 

KEY `FK_4` (`transportation_request_status_id`), 

CONSTRAINT `FK_162_2` FOREIGN KEY `FK_4` (`transportation_request_status_id`) REFERENCES `transportation_request_status` (`transportation_request_status_id`), 

KEY `FK_5` (`created_by`), 

CONSTRAINT `FK_164` FOREIGN KEY `FK_5` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_6` (`last_updated_by`), 

CONSTRAINT `FK_166` FOREIGN KEY `FK_6` (`last_updated_by`) REFERENCES `user` (`user_id`) 

); 

 

 
--------------------------------------------------------------------
 

 

 

 


 

CREATE TABLE `purchase_order_transportation_request` 

( 

 `purchase_order_transportation_request_id` varchar(32) NOT NULL , 

 `purchase_order_id`                        varchar(32) NOT NULL , 

 `last_updated_by`                          varchar(32) NOT NULL , 

 `transportation_request_type_id`           varchar(25) NOT NULL , 

 `created_by`                               varchar(32) NOT NULL , 

 `from_location`                            varchar(100) NOT NULL , 

 `to_location`                              varchar(100) NOT NULL , 

 `additional_details`                       varchar(100) NOT NULL , 

 `created_at`                               datetime NOT NULL , 

 `last_updated_at`                          datetime NOT NULL , 

 `urgent_order_status_id`                   int NOT NULL , 

 `transportation_request_status_id`         int NOT NULL , 

 `future_transportation_date`               date NOT NULL , 

 `transportation_time`                      time NOT NULL , 

 

PRIMARY KEY (`purchase_order_transportation_request_id`), 

KEY `FK_4` (`created_by`), 

CONSTRAINT `FK_118` FOREIGN KEY `FK_4` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_5` (`transportation_request_type_id`), 

CONSTRAINT `FK_128_1` FOREIGN KEY `FK_5` (`transportation_request_type_id`) REFERENCES `transportation_request_type` (`transportation_request_type_id`), 

KEY `FK_7` (`last_updated_by`), 

CONSTRAINT `FK_159` FOREIGN KEY `FK_7` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_7_1` (`purchase_order_id`), 

CONSTRAINT `FK_158_2` FOREIGN KEY `FK_7_1` (`purchase_order_id`) REFERENCES `purchase_order` (`purchase_order_id`), 

KEY `FK_7_2` (`urgent_order_status_id`), 

CONSTRAINT `FK_11` FOREIGN KEY `FK_7_2` (`urgent_order_status_id`) REFERENCES `urgent_order_status` (`urgent_order_status_id`), 

KEY `FK_7_3` (`transportation_request_status_id`), 

CONSTRAINT `FK_158` FOREIGN KEY `FK_7_3` (`transportation_request_status_id`) REFERENCES `transportation_request_status` (`transportation_request_status_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 

 

 

 

 

 


 

CREATE TABLE `purchase_order_request_item_comment` 

( 

 `purchase_order_request_item_comment_id` varchar(32) NOT NULL , 

 `purchase_order_request_item_id`         varchar(32) NOT NULL , 

 `created_by`                             varchar(32) NOT NULL , 

 `comment_text`                           varchar(100) NOT NULL , 

 `created_at`                             datetime NOT NULL , 

 

PRIMARY KEY (`purchase_order_request_item_comment_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_128` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3_1` (`purchase_order_request_item_id`), 

CONSTRAINT `FK_158_6` FOREIGN KEY `FK_3_1` (`purchase_order_request_item_id`) REFERENCES `purchase_order_request_item` (`purchase_order_request_item_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 

 

 

 

 

 


 

CREATE TABLE `purchase_order_item` 

( 

 `purchase_order_item_id`        varchar(32) NOT NULL , 

 `purchase_order_id`             varchar(32) NOT NULL , 

 `created_by`                    varchar(32) NOT NULL , 

 `last_updated_by`               varchar(32) NOT NULL , 

 `price`                         varchar(15) NOT NULL , 

 `quantity`                      varchar(10) NOT NULL , 

 `unit_of_measure`               varchar(10) NOT NULL , 

 `description`                   varchar(100) NOT NULL , 

 `created_at`                    datetime NOT NULL , 

 `last_updated_at`               datetime NOT NULL , 

 `is_damaged`                    binary NOT NULL , 

 `damage_or_return_text`         varchar(100) NOT NULL , 

 `project_id`                    int NOT NULL , 

 `purchase_order_item_status_id` int NOT NULL , 

 

PRIMARY KEY (`purchase_order_item_id`), 

KEY `FK_7` (`created_by`), 

CONSTRAINT `FK_116` FOREIGN KEY `FK_7` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_7_2` (`project_id`), 

CONSTRAINT `FK_1` FOREIGN KEY `FK_7_2` (`project_id`) REFERENCES `project` (`project_id`), 

KEY `FK_7_3` (`purchase_order_item_status_id`), 

CONSTRAINT `FK_2` FOREIGN KEY `FK_7_3` (`purchase_order_item_status_id`) REFERENCES `purchase_order_item_status` (`purchase_order_item_status_id`), 

KEY `FK_8` (`last_updated_by`), 

CONSTRAINT `FK_159_1` FOREIGN KEY `FK_8` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_8_1` (`purchase_order_id`), 

CONSTRAINT `FK_159_4` FOREIGN KEY `FK_8_1` (`purchase_order_id`) REFERENCES `purchase_order` (`purchase_order_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 

 

 

 

 

 


 

CREATE TABLE `purchase_order_comment` 

( 

 `purchase_order_comment_id` varchar(32) NOT NULL , 

 `purchase_order_id`         varchar(32) NOT NULL , 

 `created_by`                varchar(32) NOT NULL , 

 `created_at`                datetime NOT NULL , 

 `comment_text`              varchar(100) NOT NULL , 

 

PRIMARY KEY (`purchase_order_comment_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_122` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3_1` (`purchase_order_id`), 

CONSTRAINT `FK_158_4` FOREIGN KEY `FK_3_1` (`purchase_order_id`) REFERENCES `purchase_order` (`purchase_order_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 

 

 

 

 

 


 

CREATE TABLE `ocr_purchase_order_draft_by_created_purchase_order` 

( 

 `ocr_imported_purchase_order_draft_id` varchar(32) NOT NULL , 

 `purchase_order_id`                    varchar(32) NOT NULL , 

 

PRIMARY KEY (`ocr_imported_purchase_order_draft_id`, `purchase_order_id`), 

KEY `FK_2` (`ocr_imported_purchase_order_draft_id`), 

CONSTRAINT `FK_126_1` FOREIGN KEY `FK_2` (`ocr_imported_purchase_order_draft_id`) REFERENCES `ocr_imported_purchase_order_draft` (`ocr_imported_purchase_order_draft_id`), 

KEY `FK_3` (`purchase_order_id`), 

CONSTRAINT `FK_158_5` FOREIGN KEY `FK_3` (`purchase_order_id`) REFERENCES `purchase_order` (`purchase_order_id`) 

); 

 

 

 

 

 

 


 

CREATE TABLE `ocr_imported_purchase_order_draft_item` 

( 

 `ocr_imported_purchase_order_draft_item_id` varchar(32) NOT NULL , 

 `ocr_imported_purchase_order_draft_id`      varchar(32) NOT NULL , 

 `created_by`                                varchar(32) NOT NULL , 

 `last_updated_by`                           varchar(32) NOT NULL , 

 `item_name`                                 varchar(45) NOT NULL , 

 `price`                                     varchar(20) NOT NULL , 

 `quantity`                                  int NOT NULL , 

 `unit_of_measure`                           varchar(20) NOT NULL , 

 `description`                               varchar(100) NOT NULL , 

 `created_at`                                datetime NOT NULL , 

 `last_updated_at`                           datetime NOT NULL , 

 `project_id`                                int NOT NULL , 

 `purchase_order_item_status_id`             int NOT NULL , 

 

PRIMARY KEY (`ocr_imported_purchase_order_draft_item_id`), 

KEY `FK_5` (`created_by`), 

CONSTRAINT `FK_123` FOREIGN KEY `FK_5` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_5_1` (`ocr_imported_purchase_order_draft_id`), 

CONSTRAINT `FK_124_1` FOREIGN KEY `FK_5_1` (`ocr_imported_purchase_order_draft_id`) REFERENCES `ocr_imported_purchase_order_draft` (`ocr_imported_purchase_order_draft_id`), 

KEY `FK_6` (`last_updated_by`), 

CONSTRAINT `FK_162` FOREIGN KEY `FK_6` (`last_updated_by`) REFERENCES `user` (`user_id`), 

KEY `FK_6_1` (`project_id`), 

CONSTRAINT `FK_30` FOREIGN KEY `FK_6_1` (`project_id`) REFERENCES `project` (`project_id`), 

KEY `FK_6_2` (`purchase_order_item_status_id`), 

CONSTRAINT `FK_31` FOREIGN KEY `FK_6_2` (`purchase_order_item_status_id`) REFERENCES `purchase_order_item_status` (`purchase_order_item_status_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 

 

 

 

 

 


 

CREATE TABLE `ocr_imported_purchase_order_draft_comment` 

( 

 `ocr_imported_purchase_order_draft_comment_id` varchar(32) NOT NULL , 

 `ocr_imported_purchase_order_draft_id`         varchar(32) NOT NULL , 

 `created_by`                                   varchar(32) NOT NULL , 

 `created_at`                                   datetime NOT NULL , 

 `comment_text`                                 varchar(100) NOT NULL , 

 

PRIMARY KEY (`ocr_imported_purchase_order_draft_comment_id`), 

KEY `FK_2` (`ocr_imported_purchase_order_draft_id`), 

CONSTRAINT `FK_129` FOREIGN KEY `FK_2` (`ocr_imported_purchase_order_draft_id`) REFERENCES `ocr_imported_purchase_order_draft` (`ocr_imported_purchase_order_draft_id`), 

KEY `FK_4` (`created_by`), 

CONSTRAINT `FK_131` FOREIGN KEY `FK_4` (`created_by`) REFERENCES `user` (`user_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 

 

 

 

 

 


 

CREATE TABLE `item_transportation_request_image` 

( 

 `item_transportation_request_image_id` varchar(255) NOT NULL , 

 `item_transportation_request_id`       varchar(32) NOT NULL , 

 `created_by`                           varchar(32) NOT NULL , 

 `created_at`                           datetime NOT NULL , 

 

PRIMARY KEY (`item_transportation_request_image_id`), 

KEY `FK_2` (`item_transportation_request_id`), 

CONSTRAINT `FK_129_2` FOREIGN KEY `FK_2` (`item_transportation_request_id`) REFERENCES `item_transportation_request` (`item_transportation_request_id`), 

KEY `FK_4` (`created_by`), 

CONSTRAINT `FK_134` FOREIGN KEY `FK_4` (`created_by`) REFERENCES `user` (`user_id`) 

) COMMENT='id = s3_uri with a max length of 255 chars'; 

 

 

 

 

 

 


 

CREATE TABLE `item_transportation_request_comment` 

( 

 `item_transportation_request_comment_id` varchar(32) NOT NULL , 

 `item_transportation_request_id`         varchar(32) NOT NULL , 

 `created_by`                             varchar(32) NOT NULL , 

 `comment_text`                           varchar(100) NOT NULL , 

 `created_at`                             datetime NOT NULL , 

 

PRIMARY KEY (`item_transportation_request_comment_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_114` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_3_1` (`item_transportation_request_id`), 

CONSTRAINT `FK_153_1` FOREIGN KEY `FK_3_1` (`item_transportation_request_id`) REFERENCES `item_transportation_request` (`item_transportation_request_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 

 

 

 

 

 


 

CREATE TABLE `transportation_trip_by_purchase_order_transportation_request` 

( 

 `purchase_order_transportation_request_id` varchar(32) NOT NULL , 

 `transportation_trip_id`                   varchar(32) NOT NULL , 

 `transportation_request_status_id`         int NOT NULL , 

 `last_updated_by`                          varchar(32) NOT NULL , 

 `created_by`                               varchar(32) NOT NULL , 

 `created_at`                               datetime NOT NULL , 

 `last_updated_at`                          datetime NOT NULL , 

 

PRIMARY KEY (`purchase_order_transportation_request_id`, `transportation_trip_id`), 

KEY `FK_3` (`purchase_order_transportation_request_id`), 

CONSTRAINT `FK_25` FOREIGN KEY `FK_3` (`purchase_order_transportation_request_id`) REFERENCES `purchase_order_transportation_request` (`purchase_order_transportation_request_id`), 

KEY `FK_3_1` (`transportation_trip_id`), 

CONSTRAINT `FK_158_3` FOREIGN KEY `FK_3_1` (`transportation_trip_id`) REFERENCES `transportation_trip` (`transportation_trip_id`), 

KEY `FK_4` (`transportation_request_status_id`), 

CONSTRAINT `FK_163` FOREIGN KEY `FK_4` (`transportation_request_status_id`) REFERENCES `transportation_request_status` (`transportation_request_status_id`), 

KEY `FK_5` (`created_by`), 

CONSTRAINT `FK_165` FOREIGN KEY `FK_5` (`created_by`) REFERENCES `user` (`user_id`), 

KEY `FK_6` (`last_updated_by`), 

CONSTRAINT `FK_167` FOREIGN KEY `FK_6` (`last_updated_by`) REFERENCES `user` (`user_id`) 

); 

 

 

 

 

 

 


 

CREATE TABLE `purchase_order_transportation_request_comment` 

( 

 `purchase_order_transportation_request_comment_id` varchar(32) NOT NULL , 

 `purchase_order_transportation_request_id`         varchar(32) NOT NULL , 

 `created_by`                                       varchar(32) NOT NULL , 

 `created_at`                                       datetime NOT NULL , 

 `comment_text`                                     varchar(100) NOT NULL , 

 

PRIMARY KEY (`purchase_order_transportation_request_comment_id`), 

KEY `FK_2` (`purchase_order_transportation_request_id`), 

CONSTRAINT `FK_16` FOREIGN KEY `FK_2` (`purchase_order_transportation_request_id`) REFERENCES `purchase_order_transportation_request` (`purchase_order_transportation_request_id`), 

KEY `FK_3` (`created_by`), 

CONSTRAINT `FK_121` FOREIGN KEY `FK_3` (`created_by`) REFERENCES `user` (`user_id`) 

) COMMENT='PK = 32 Byte character UUID'; 

 
 

CREATE TABLE `purchase_order_request_item_by_purchase_order_item` 

( 

 `purchase_order_item_id`         varchar(32) NOT NULL , 

 `purchase_order_request_item_id` varchar(32) NOT NULL , 

 

PRIMARY KEY (`purchase_order_item_id`, `purchase_order_request_item_id`), 

KEY `FK_1` (`purchase_order_item_id`), 

CONSTRAINT `FK_158_1` FOREIGN KEY `FK_1` (`purchase_order_item_id`) REFERENCES `purchase_order_item` (`purchase_order_item_id`), 

KEY `FK_2` (`purchase_order_request_item_id`), 

CONSTRAINT `FK_159_6` FOREIGN KEY `FK_2` (`purchase_order_request_item_id`) REFERENCES `purchase_order_request_item` (`purchase_order_request_item_id`) 

); 
 

CREATE TABLE `ocr_imported_purchase_order_draft_item_by_purchase_order_item` 

( 

 `purchase_order_item_id`                    varchar(32) NOT NULL , 

 `ocr_imported_purchase_order_draft_item_id` varchar(32) NOT NULL , 

 

PRIMARY KEY (`purchase_order_item_id`, `ocr_imported_purchase_order_draft_item_id`), 

KEY `FK_1` (`purchase_order_item_id`), 

CONSTRAINT `FK_160_1` FOREIGN KEY `FK_1` (`purchase_order_item_id`) REFERENCES `purchase_order_item` (`purchase_order_item_id`), 

KEY `FK_2` (`ocr_imported_purchase_order_draft_item_id`), 

CONSTRAINT `FK_161_1` FOREIGN KEY `FK_2` (`ocr_imported_purchase_order_draft_item_id`) REFERENCES `ocr_imported_purchase_order_draft_item` (`ocr_imported_purchase_order_draft_item_id`) 

); 