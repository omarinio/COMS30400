﻿using System.Collections;
using System.Collections.Generic;
using Mirror;
using UnityEngine;

public class PlayerMovement : NetworkBehaviour
{
    public CharacterController controller;
    public Transform groundCheck;
    public LayerMask groundMask;

    private float gravity = -17f;
    private float speed = 12f;
    private float jumpHeight = 3.5f;

    private Vector3 velocity;
    private float groundDistance = 0.4f;
    private bool isGrounded;
    private bool climbing;
    private bool onTrain;
    private Transform prev;

    [ClientCallback]
    // Update is called once per frame
    void Update()
    {
        if (!hasAuthority) return;

        // Checks if the groundCheck object is within distance to the ground layer
        isGrounded = Physics.CheckSphere(groundCheck.position, groundDistance, groundMask);

        // Prevents downward velocity from decreasing infinitely if player is on the ground
        if (isGrounded && velocity.y < 0)
        {
            velocity.y = -3f;
        }

        float x = Input.GetAxis("Horizontal");
        float z = Input.GetAxis("Vertical");

        Vector3 move;

        if(climbing && z > 0f) {
            move = transform.right * x + transform.up * z;
        } else {
            move = transform.right * x + transform.forward * z;
        }

        if (onTrain)
        {
            move += Vector3.MoveTowards(gameObject.transform.position, GameObject.FindGameObjectWithTag("locomotive").transform.position, Time.deltaTime) - GameObject.FindGameObjectWithTag("locomotive").transform.position;
            move.y = 0f;
        }

        controller.Move(move * speed * Time.deltaTime);

        // Checks if jump button is pressed and allows user to jump if they are on the ground
        if(Input.GetButtonDown("Jump") && isGrounded)
        {
            onTrain = false;
            velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);
        }

        velocity.y += gravity * Time.deltaTime;

        controller.Move(velocity * Time.deltaTime);

        // if (climbing) {
        //     Vector3 climb = transform.up * Input.GetAxis("Vertical");
        //     controller.Move(climb * 10f * Time.deltaTime);
        // }
    }
    
    void OnTriggerEnter(Collider other) {
        if (other.gameObject.tag == "locomotive") {
            Debug.Log("PLAYER ENTERED LADDER");
            climbing = true;
        }
        else if (other.gameObject.tag == "trainfloor")
        {
            Debug.Log("stef is aiiiir");
            //gameObject.transform.SetParent(GameObject.FindGameObjectWithTag("locomotive").transform);
            onTrain = true;
        }
    }

    void OnTriggerExit(Collider other) {
        if (climbing && other.gameObject.tag == "locomotive") {
            Debug.Log("player stopped climbing");
            climbing = false;
        }
        else if (onTrain && other.gameObject.tag == "trainfloor")
        {
            Debug.Log("stef is NOT aiiiir");
            onTrain = false;
        }
    }
}
