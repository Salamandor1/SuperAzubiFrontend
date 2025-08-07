export interface Fight_response_data{
  logID: {
    playerTeamID: number;
    npcTeamID: number;
  };
  log: string;
} 

function retrieveLog(fight_response_data: Fight_response_data) : string {
  return fight_response_data.log;
}