#pragma once

namespace XAudioPlayer
{
	public delegate void SoundEndedHandler(int index);

	public ref class XAudio2SoundPlayer sealed
	{
		struct ImplData;
	public:
		XAudio2SoundPlayer();
		virtual ~XAudio2SoundPlayer();

		size_t   LoadSounds();
		bool   PlaySound(size_t index);
		bool   StopSound(size_t index);
		bool   IsSoundPlaying(size_t index);
		size_t GetSoundCount();

		void Suspend();
		void Resume();

		event SoundEndedHandler^ SoundEnded;
		void RaiseEndEvent(int index);
	private:
		
		size_t AddSound(_In_ WAVEFORMATEX* format, _In_ Platform::Array<byte>^ data,_In_ int index );
		interface IXAudio2*                     m_audioEngine;
		interface IXAudio2MasteringVoice*       m_masteringVoice;
		std::vector<std::shared_ptr<ImplData>>  m_soundList;
		static const uint32 SOUND_SAMPLE_RATE = 48000;
	};
}