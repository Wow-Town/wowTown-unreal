// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "WowDefaultCharacter.generated.h"

UCLASS(Blueprintable)
class AWowDefaultCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	AWowDefaultCharacter();

	// Called every frame.
	virtual void Tick(float DeltaSeconds) override;

	/** Returns TopDownCameraComponent subobject **/
	FORCEINLINE class UCameraComponent* GetTopDownCameraComponent() const { return TopDownCameraComponent; }
	/** Returns CameraBoom subobject **/
	FORCEINLINE class USpringArmComponent* GetCameraBoom() const { return CameraBoom; }
	/** Returns CursorToWorld subobject **/
	FORCEINLINE class UDecalComponent* GetCursorToWorld() { return CursorToWorld; }

	UPROPERTY(EditAnywhere)
	float MoveSpeed=200.0f;
protected:
	//폰의 캐릭터 움직임 바인딩용
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

private:
	/** Top down camera */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Camera, meta = (AllowPrivateAccess = "true"))
		class UCameraComponent* TopDownCameraComponent;

	/** Camera boom positioning the camera above the character */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Camera, meta = (AllowPrivateAccess = "true"))
		class USpringArmComponent* CameraBoom;

	/** A decal that projects to the cursor location. */
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Camera, meta = (AllowPrivateAccess = "true"))
		class UDecalComponent* CursorToWorld;

	//폰의 캐릭터 움직임 바인딩용
	void MoveForward(float AxisValue);
	//폰의 캐릭터 움직임 바인딩용
	void MoveBackward(float AxisValue);
	//폰의 캐릭터 움직임 바인딩용
	void MoveLeft(float AxisValue);
	//폰의 캐릭터 움직임 바인딩용
	void MoveRight(float AxisValue);

	UWorld* MyWorld;
};
