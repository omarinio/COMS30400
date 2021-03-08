﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Photon.Pun;

public class PhotonPlayer : MonoBehaviourPunCallbacks
{
    public GameObject playerUI;
    private GameObject uiRef;
    public string gesture;


    // Start is called before the first frame update
    void Start()
    {
        //uiRef = Instantiate(playerUI);
        //uiRef.transform.parent = gameObject.transform;
        gesture = PoseParser.GETGestureAsString();
    }

    // Update is called once per frame
    void Update()
    {
        if (!photonView.IsMine)
        {
            return;
        }
        string tempGesture = PoseParser.GETGestureAsString();
        if (tempGesture != gesture)
        {
            gesture = tempGesture;
        }
        Debug.Log(gesture);
    }

    public bool IsPressingP()
    {
        if (Input.GetKeyDown(KeyCode.P))
        {
            return true;
        }
        return false;
    }
}
