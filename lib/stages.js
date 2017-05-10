
const STAGES = {
  INITIALIZE   : "INITIALIZE",
  ENSURE       : "ENSURE",
  INITIALIZED  : "INITIALIZED",
  APP_UPLOAD   : "APP_UPLOAD",
  BEFORE_START : "BEFORE_START",
  START_APP    : "START_APP",
  AFTER_START  : "AFTER_START",
  BLUEGREEN    : "BLUEGREEN",
  BEFORE_STOP  : "BEFORE_STOP",
  STOP_APP     : "STOP_APP",
  AFTER_STOP   : "AFTER_STOP",
  APP_READY    : "APP_READY",
}

const NEXT_STAGE = {
  [STAGES.INITIALIZE]   : STAGES.ENSURE,
  [STAGES.ENSURE]       : STAGES.INITIALIZED,
  [STAGES.INITIALIZED]  : STAGES.APP_UPLOAD,
  [STAGES.APP_UPLOAD]   : STAGES.BEFORE_START,
  [STAGES.BEFORE_START] : STAGES.START_APP,
  [STAGES.START_APP]    : STAGES.AFTER_START,
  [STAGES.AFTER_START]  : STAGES.BLUEGREEN,
  [STAGES.BLUEGREEN]    : STAGES.BEFORE_STOP,
  [STAGES.BEFORE_STOP]  : STAGES.STOP_APP,
  [STAGES.STOP_APP]     : STAGES.AFTER_STOP,
  [STAGES.AFTER_STOP]   : STAGES.APP_READY,
}

const STAGE_DESC = {
  [STAGES.INITIALIZE]   : "Initialize the script and upload the deployment scripts",
  [STAGES.ENSURE]       : "Ensure that all services are running",
  [STAGES.INITIALIZED]  : "Run the last bits of code after all resources are available",
  [STAGES.APP_UPLOAD]   : "Upload the new files",
  [STAGES.BEFORE_START] : "Run scripts bevore the application starts",
  [STAGES.START_APP]    : "Starting the application",
  [STAGES.AFTER_START]  : "Run scripts after the applications starts",
  [STAGES.BLUEGREEN]    : "Run switch from the current version to the new one",
  [STAGES.BEFORE_STOP]  : "Run scripts before the old application shuts down",
  [STAGES.STOP_APP]     : "Shut down the old application",
  [STAGES.AFTER_STOP]   : "Run scripts before the old application shuts down",
}

module.exports = {
  STAGES, STAGE_DESC, NEXT_STAGE
}
