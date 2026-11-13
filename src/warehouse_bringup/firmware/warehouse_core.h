#ifndef WAREHOUSE_CORE_H
#define WAREHOUSE_CORE_H
#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
typedef bool (*warehouse_can_send)(uint16_t id,const uint8_t data[8]);
typedef void (*warehouse_inhibit)(bool inhibit);
typedef struct {
  uint8_t node_id; int left_sign,right_sign; int32_t max_rpm;
  warehouse_can_send send; warehouse_inhibit inhibit;
  uint32_t now,last_command,last_response,request_time,last_seq;
  bool rearm_required,pending_advances,seen_command,pending,estop,fault,enabled,requested_enable;
  float left_rad_s,right_rad_s;
  int32_t left_ticks,right_ticks; uint16_t statusword;
  uint16_t pending_index; uint8_t pending_sub,pending_command;
  int phase,poll; uint32_t telemetry_seq;
} warehouse_core;
void warehouse_init(warehouse_core *s,uint8_t node,int left_sign,int right_sign,warehouse_can_send tx,warehouse_inhibit inhibit);
bool warehouse_command(warehouse_core *s,const char *line,size_t length,uint32_t now);
void warehouse_tick(warehouse_core *s,uint32_t now,bool estop);
void warehouse_can_receive(warehouse_core *s,uint16_t id,const uint8_t data[8],uint32_t now);
size_t warehouse_telemetry(warehouse_core *s,char *output,size_t capacity,uint32_t now);
uint16_t warehouse_crc16(const uint8_t *data,size_t size);
void warehouse_sdo(uint8_t out[8],uint8_t command,uint16_t index,uint8_t sub,int32_t value);
#endif
