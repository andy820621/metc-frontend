/** Reference
 * https://github.com/jitsi/jitsi-meet-vue-sdk/tree/master/src/types
 */

import EventEmitter from "events";

export type executeCommandArgs = any[] | undefined[];

export interface IJitsiMeetExternalApi extends EventEmitter {
  /**
   * Captures the screenshot of the large video.
   * Resolves with a base64 encoded image data of the screenshot
   * if large video is detected, throws an error otherwise.
   */
  captureLargeVideoScreenshot: () => Promise<string>;

  /**
   * Removes the listeners and removes the Jitsi Meet frame.
   */
  dispose: () => void;

  /**
   * Executes command.
   */
  executeCommand: (name: string, ...args: executeCommandArgs) => void;

  /**
   * Executes commands.
   * The keys of the object parameter are the commands that will be executed and the
   * values are the arguments for the command.
   */
  executeCommands: (commands: {
    [command: string]: executeCommandArgs;
  }) => void;

  /**
   * Returns Promise that resolves with a list of available devices.
   */
  getAvailableDevices: () => Promise<object[]>;

  /**
   * Returns the avatar URL of a participant.
   */
  getAvatarURL: (participantId: string) => string;

  /**
   * Gets a list of the currently sharing participant ids.
   */
  getContentSharingParticipants: () => Promise<string[]>;

  /**
   * Returns Promise that resolves with current selected devices.
   */
  getCurrentDevices: () => Promise<object[]>;

  /**
   * Returns any custom avatars backgrounds.
   */
  getCustomAvatarBackgrounds: () => Promise<string[]>;

  /**
   * Gets the deployment info.
   */
  getDeploymentInfo: () => Promise<object>;

  /**
   * Returns the display name of a participant.
   */
  getDisplayName: (participantId: string) => string;

  /**
   * Returns the email of a participant.
   */
  getEmail: (participantId: string) => string;

  /**
   * Returns the IFrame that loads the Jitsi Meet External API.
   */
  getIFrame: () => HTMLElement;

  /**
   * Returns the current livestream url.
   * Resolves with the current livestream URL if exists, with
   * undefined if not, and rejects on failure.
   */
  getLivestreamUrl: () => Promise<string | undefined>;

  /**
   * Returns the number of participants in the conference.
   * The local participant is included.
   */
  getNumberOfParticipants: () => number;

  /**
   * Returns the conference participants information as an array containing participants
   * information like participant id, display name, avatar URL and email.
   */
  getParticipantsInfo: () => object[];

  /**
   * Returns the current video quality setting.
   */
  getVideoQuality: () => number;

  /**
   * Invite people to the call.
   */
  invite: (invitees: object[]) => Promise<object[]>;

  /**
   * Check if the audio is available.
   */
  isAudioAvailable: () => Promise<boolean>;

  /**
   * Returns the audio mute status.
   */
  isAudioMuted: () => Promise<boolean>;

  /**
   * Returns whether the device change is available.
   */
  isDeviceChangeAvailable: () => Promise<boolean>;

  /**
   * Returns whether the device list is available.
   */
  isDeviceListAvailable: () => Promise<boolean>;

  /**
   * Returns the moderation on status on the given mediaType.
   */
  isModerationOn: () => Promise<boolean>;

  /**
   * Returns whether multiple audio input is supported.
   */
  isMultipleAudioInputSupported: () => Promise<boolean>;

  /**
   * Returns force muted status of the given participant id for the given media type.
   */
  isParticipantForceMuted: (
    participantId: string,
    mediaType: string
  ) => Promise<boolean>;

  /**
   * Returns screen sharing status.
   */
  isSharingScreen: () => Promise<boolean>;

  /**
   * Check if the video is available.
   */
  isVideoAvailable: () => Promise<boolean>;

  /**
   * Returns the audio mute status.
   */
  isVideoMuted: () => Promise<boolean>;

  /**
   * Pins a participant's video on to the stage view.
   */
  pinParticipant: (participantId: string) => void;

  /**
   * Removes the given event listener.
   */
  removeEventListener: (event: string) => void;

  /**
   * Removes event listeners for the given list.
   */
  removeEventListeners: (eventList: string[]) => void;

  /**
   * Resizes the large video container as per the dimensions provided.
   */
  resizeLargeVideo: (width: number, height: number) => void;

  /**
   * Passes an event along to the local conference participant to establish
   * or update a direct peer connection. This is currently used for developing
   * wireless screensharing with room integration and it is advised against to
   * use as its api may change.
   */
  sendProxyConnectionEvent: (event: {
    /**
     * The payload of the event.
     */
    data: object;

    /**
     * The JID of the sender of the event.
     * Needed when a reply is to be sent regarding the event.
     */
    form: string;
  }) => void;

  /**
   * Sets the audio input device to the one with the label or id that is passed.
   */
  setAudioInputDevice: (label: string, deviceId: string) => Promise<void>;

  /**
   * Sets the audio output device to the one with the label or id that is passed.
   */
  setAudioOutputDevice: (label: string, deviceId: string) => Promise<void>;

  /**
   * Displays the given participant on the large video. If no participant id is specified,
   * dominant and pinned speakers will be taken into consideration while selecting the
   * the large video participant.
   */
  setLargeVideoParticipant: (participantId: string) => void;

  /**
   * Sets the video input device to the one with the label or id that is passed.
   */
  setVideoInputDevice: (label: string, deviceId: string) => Promise<void>;

  /**
   * Starts a file recording or streaming session depending on the passed on params.
   * * For RTMP streams, `rtmpStreamKey` must be passed on. `rtmpBroadcastID` is optional.
   * * For youtube streams, `youtubeStreamKey` must be passed on. `youtubeBroadcastID` is optional.
   * * For dropbox recording, recording `mode` should be `file` and a dropbox oauth2 token must be provided.
   * * For file recording, recording `mode` should be `file` and optionally `shouldShare` could be passed on.
   *
   * No other params should be passed.
   */
  startRecording: (options: {
    /**
     * The recording mode.
     */
    mode: "file" | "stream";

    /**
     * The dropbox oauth2 token.
     */
    dropboxToken: string;

    /**
     * Whether the recording should be shared with the participants or not.
     * Only applies to certain Jitsi Meet deploys.
     */
    shouldShare: boolean;

    /**
     * The RTMP stream key.
     */
    rtmpStreamKey: string;

    /**
     * The RTMP broacast ID.
     */
    rtmpBroadcastID: string;

    /**
     * The youtube stream key.
     */
    youtubeStreamKey: string;

    /**
     * The youtube broacast ID.
     */
    youtubeBroadcastID: string;
  }) => void;

  /**
   * Stops a recording or streaming session that is in progress.
   */
  stopRecording: (mode: "file" | "stream") => void;
}

export interface JitsiMeetExternalApiOptions {
  /**
   * The name of the room to join.
   */
  roomName?: string;

  /**
   * The created IFrame width.
   */
  width?: string | number;

  /**
   * The height for the created IFrame.
   */
  height?: string | number;

  /**
   * The JS object with overrides for options defined in the config.js file
   * https://github.com/jitsi/jitsi-meet/blob/master/config.js.
   */
  configOverwrite?: object;

  /**
   * The JS object with overrides for options defined in the interface_config.js file
   * https://github.com/jitsi/jitsi-meet/blob/master/interface_config.js.
   */
  interfaceConfigOverwrite?: object;

  /**
   * The JWT token.
   */
  jwt?: string;

  /**
   * The IFrame onload event handler.
   */
  onload?: () => void;

  /**
   * Object arrays that contain information about participants invited to a call.
   */
  invitees?: [];

  /**
   * Information map about the devices used in a call.
   */
  devices?: {
    /**
     * The label of the device used for audio input.
     */
    audioInput: string;

    /**
     * The label of the device  used for audio output.
     */
    audioOutput: string;

    /**
     * The label of the device used for video input.
     */
    videoInput: string;
  };

  /**
   * The JS object that contains information about the participant starting the meeting.
   */
  userInfo?: {
    /**
     * The participant display name.
     */
    displayName: string;

    /**
     * The participant email address.
     */
    email: string;
  };

  /**
   * The HTML DOM Element where the IFrame is added as a child.
   */
  parentNode?: HTMLElement | null;

  /**
   * The default meeting language
   */
  lang?: string;
}

export type JitsiMeetExternalApi = {
  new (
    /**
     * The domain used to build the conference URL.
     */
    domain: string,

    /**
     * The optional arguments for the IFrame.
     */
    options: JitsiMeetExternalApiOptions
  ): IJitsiMeetExternalApi;
};
