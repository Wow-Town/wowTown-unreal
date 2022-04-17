// Copyright Epic Games, Inc. All Rights Reserved.

#include "WowProjectGameMode.h"
#include "WowProjectPlayerController.h"
#include "WowProjectCharacter.h"
#include "UObject/ConstructorHelpers.h"

AWowProjectGameMode::AWowProjectGameMode()
{
	// use our custom PlayerController class
	PlayerControllerClass = AWowProjectPlayerController::StaticClass();

	// set default pawn class to our Blueprinted character
	static ConstructorHelpers::FClassFinder<APawn> PlayerPawnBPClass(TEXT("/Game/TopDownCPP/Blueprints/TopDownCharacter"));
	if (PlayerPawnBPClass.Class != nullptr)
	{
		DefaultPawnClass = PlayerPawnBPClass.Class;
	}
}