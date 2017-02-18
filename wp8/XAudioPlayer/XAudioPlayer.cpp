// XAudioPlayer.cpp
#include "pch.h"
#include "XAudioPlayer.h"
#include "DirectXSample.h"
#include "SoundFileReader.h"

using namespace XAudioPlayer;
using namespace Platform;


namespace XAudioPlayer
{
	//
	// Handler for XAudio source voice callbacks to maintain playing state
	//
	class SoundCallbackHander : public IXAudio2VoiceCallback
	{
	public:
		SoundCallbackHander(bool* isPlayingHolder,XAudio2SoundPlayer^ parent,int index) :
			m_isPlayingHolder(isPlayingHolder),
			parentRef(parent)
		{
			soundIndex=index;
		}

		~SoundCallbackHander()
		{
			m_isPlayingHolder = nullptr;
		}

		//
		// Voice callbacks from IXAudio2VoiceCallback
		//
		STDMETHOD_(void, OnVoiceProcessingPassStart) (THIS_ UINT32 bytesRequired);
		STDMETHOD_(void, OnVoiceProcessingPassEnd) (THIS);
		STDMETHOD_(void, OnStreamEnd) (THIS);
		STDMETHOD_(void, OnBufferStart) (THIS_ void* bufferContext);
		STDMETHOD_(void, OnBufferEnd) (THIS_ void* bufferContext);
		STDMETHOD_(void, OnLoopEnd) (THIS_ void* bufferContext);
		STDMETHOD_(void, OnVoiceError) (THIS_ void* bufferContext, HRESULT error);

	private:
		bool* m_isPlayingHolder;
		XAudio2SoundPlayer^ parentRef;
		int soundIndex;
	};

	//
	// Callback handlers, only implement the buffer events for maintaining play state
	//
	void SoundCallbackHander::OnVoiceProcessingPassStart(UINT32 /*bytesRequired*/)
	{
	}
	void SoundCallbackHander::OnVoiceProcessingPassEnd()
	{
	}
	void SoundCallbackHander::OnStreamEnd()
	{
	}
	void SoundCallbackHander::OnBufferStart(void* /*bufferContext*/)
	{
		*m_isPlayingHolder = true;
	}
	void SoundCallbackHander::OnBufferEnd(void* /*bufferContext*/)
	{
		*m_isPlayingHolder = false;
		parentRef->RaiseEndEvent(soundIndex);
	}
	void SoundCallbackHander::OnLoopEnd(void* /*bufferContext*/)
	{
	}
	void SoundCallbackHander::OnVoiceError(void* /*bufferContext*/, HRESULT /*error*/)
	{
	}

	//
	// Per sound data required to play a sound
	//
	struct XAudio2SoundPlayer::ImplData
	{
		ImplData::ImplData(Platform::Array<byte>^ data,XAudio2SoundPlayer^ parent,int index) :
			sourceVoice(nullptr),
			playData(data),
			isPlaying(false),
			callbackHander(&isPlaying,parent,index)
		{
		}

		~ImplData()
		{
			if (sourceVoice)
			{
				sourceVoice->DestroyVoice();
				sourceVoice = nullptr;
			}
		}

		IXAudio2SourceVoice*    sourceVoice;
		Platform::Array<byte>^  playData;
		bool                    isPlaying;
		SoundCallbackHander     callbackHander;
	};

	void XAudio2SoundPlayer::RaiseEndEvent(int index)
	{
		SoundEnded(index);
	}

	//--------------------------------------------------------------------------------------
	// Name: XAudio2SoundPlayer constructor
	// Desc: Setup common XAudio2 objects:
	//          XAudio2Engine
	//          Mastering Voice
	//--------------------------------------------------------------------------------------
	XAudio2SoundPlayer::XAudio2SoundPlayer() :
		m_soundList()
	{
		// Create the XAudio2 Engine
		UINT32 flags = 0;
		DX::ThrowIfFailed(
			XAudio2Create(&m_audioEngine, flags)
			);

		// Create the mastering voice
		DX::ThrowIfFailed(
			m_audioEngine->CreateMasteringVoice(
			&m_masteringVoice,
			XAUDIO2_DEFAULT_CHANNELS,
			SOUND_SAMPLE_RATE
			)
			);
	}



	//--------------------------------------------------------------------------------------
	// Name: XAudio2SoundPlayer destructor
	// Desc: Stop all playing sounds, cleanup per sound data, and destroy XAudio object.
	//          XAudio2Engine
	//          Mastering Voice
	//--------------------------------------------------------------------------------------
	XAudio2SoundPlayer::~XAudio2SoundPlayer()
	{
		if (m_masteringVoice != nullptr)
		{
			m_masteringVoice->DestroyVoice();
			m_masteringVoice = nullptr;
		}

		if (m_audioEngine != nullptr)
		{
			m_audioEngine->Release();
			m_audioEngine = nullptr;
		}
	}

	//--------------------------------------------------------------------------------------
	// Name: XAudio2SoundPlayer::PlaySound
	// Desc: Stop if already playing, setup XAudio2 Sound buffer and play
	//--------------------------------------------------------------------------------------
	bool XAudio2SoundPlayer::PlaySound(size_t index)
	{
		//
		// Setup buffer
		//
		XAUDIO2_BUFFER playBuffer = { 0 };
		std::shared_ptr<ImplData> soundData = m_soundList[index];
		playBuffer.AudioBytes = soundData->playData->Length;
		playBuffer.pAudioData = soundData->playData->Data;
		playBuffer.Flags = XAUDIO2_END_OF_STREAM;

		//
		// In case it is playing, stop it and flush the buffers.
		//
		HRESULT hr = soundData->sourceVoice->Stop();
		if (SUCCEEDED(hr))
		{
			hr = soundData->sourceVoice->FlushSourceBuffers();
		}

		//
		// Submit the sound buffer and (re)start (ignore any 'stop' failures)
		//
		hr = soundData->sourceVoice->SubmitSourceBuffer(&playBuffer);
		if (SUCCEEDED(hr))
		{
			hr = soundData->sourceVoice->Start(0, XAUDIO2_COMMIT_NOW);
		}

		return SUCCEEDED(hr);
	}

	//--------------------------------------------------------------------------------------
	// Name: XAudio2SoundPlayer::StopSound
	// Desc: Stop if playing
	//--------------------------------------------------------------------------------------
	bool XAudio2SoundPlayer::StopSound(size_t index)
	{
		std::shared_ptr<ImplData> soundData = m_soundList[index];

		HRESULT hr = soundData->sourceVoice->Stop();
		if (SUCCEEDED(hr))
		{
			hr = soundData->sourceVoice->FlushSourceBuffers();
		}

		return SUCCEEDED(hr);
	}


	//--------------------------------------------------------------------------------------
	// Name: XAudio2SoundPlayer::IsSoundPlaying
	// Desc: Returns the playing state of the sound at sent index
	//--------------------------------------------------------------------------------------
	bool XAudio2SoundPlayer::IsSoundPlaying(size_t index)
	{
		return m_soundList[index]->isPlaying;
	}

	size_t XAudio2SoundPlayer::LoadSounds()
	{
		char16* SOUND_FILE_LIST[] = {
			// music // spawn // arrow // fire // energy // buildmenu // build // castle // gameover // nobuild // intro
			L"wavs\\music.wav", // music
			L"wavs\\1-spawn.wav", // spawn
			L"wavs\\2-arrow.wav", // arrow
			L"wavs\\3-fire.wav", // fire
			L"wavs\\4-energy.wav", // energy
			L"wavs\\5-buildmenu.wav", // buildmenu
			L"wavs\\6-build.wav", // build
			L"wavs\\7-castle.wav", // castle
			L"wavs\\8-gameover.wav", // gameover
			L"wavs\\9-nobuild.wav", // nobuild
			L"wavs\\intro.wav", // intro
			nullptr
		};

		for (size_t index = 0; SOUND_FILE_LIST[index]; ++index)
		{
			try
			{
				// $CTK this is where your app will "crash" if the .wav file is not the right format
				SoundFileReader nextSound(ref new Platform::String(SOUND_FILE_LIST[index]));
				AddSound(nextSound.GetSoundFormat(), nextSound.GetSoundData(), index);
			}
			catch (Platform::FailureException^)
			{
				// If we have a failure, don't play that file, not worth stopping the whole sample
			}
		}


		return GetSoundCount();
	}

	size_t XAudio2SoundPlayer::AddSound(
		_In_ WAVEFORMATEX*  format,
		_In_ Platform::Array<byte>^   data,
		_In_ int index
		)
	{
		//
		// Allocate the implementation data
		//
		std::shared_ptr<ImplData> implData(new ImplData(data,this,index));

		//
		// Create the source voice
		//
		DX::ThrowIfFailed( // $CTK we also get exceptions here on invalid wav data even if the header chunks looked good.
			m_audioEngine->CreateSourceVoice(
			&implData->sourceVoice,
			format,
			0,
			XAUDIO2_DEFAULT_FREQ_RATIO,
			reinterpret_cast<IXAudio2VoiceCallback*>(&implData->callbackHander),
			nullptr,
			nullptr
			)
			)
			;

		//
		// Add to the list and return its index
		//
		m_soundList.push_back(implData);
		return (m_soundList.size() - 1);
	}

	//--------------------------------------------------------------------------------------
	// Name: XAudio2SoundPlayer::GetSoundCount
	// Desc: Returns the number of sounds in the sound list
	//--------------------------------------------------------------------------------------
	size_t XAudio2SoundPlayer::GetSoundCount()
	{
		return m_soundList.size();
	}

	//--------------------------------------------------------------------------------------
	// Name: XAudio2SoundPlayer::Suspend
	// Desc: Stops the XAudio2 Engine
	//--------------------------------------------------------------------------------------
	void XAudio2SoundPlayer::Suspend()
	{
		m_audioEngine->StopEngine();
	}

	//--------------------------------------------------------------------------------------
	// Name: XAudio2SoundPlayer::Resume
	// Desc: Start the XAudio2 engine
	//--------------------------------------------------------------------------------------
	void XAudio2SoundPlayer::Resume()
	{
		DX::ThrowIfFailed(
			m_audioEngine->StartEngine()
			);
	}
}