﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Photon.Pun;

public class BreakFencePhoton : MonoBehaviourPun
{
    public GameObject text;
    private GameObject[] players;
    private bool isBroken;
    // Start is called before the first frame update
    void Start()
    {
        isBroken = false;
    }

    [PunRPC]
    void SetPressPToActive()
    {
        text.SetActive(true);
    }

    [PunRPC]
    void SetPressPToNotActive()
    {
        text.SetActive(false);
    }

    // Update is called once per frame
    [PunRPC]
    void DestroyFence()
    {
        PhotonNetwork.Destroy(transform.gameObject);
    }
    void Update()
    {
        if(isBroken == true)
            return;
        players = GameObject.FindGameObjectsWithTag("Player");
        foreach (var player in players)
        {
            float tempDist = Vector3.Distance(player.transform.position, transform.position);
            if (tempDist <= 2.5f)
            {
                photonView.RPC("SetPressPToActive", player.GetComponent<PhotonView>().Owner);
            }
            else if (tempDist > 2.5f)
            {
                photonView.RPC("SetPressPToNotActive", player.GetComponent<PhotonView>().Owner);
            }
        }

        foreach (var player in players)
        {
            float tempDist = Vector3.Distance(player.transform.position, transform.position);
            string gesture = player.GetComponent<PhotonPlayer>().gesture;
            bool pPressed = player.GetComponent<PhotonPlayer>().IsPressingP();
            if ((gesture.CompareTo("P") == 0 || pPressed) && tempDist <= 2.5f)
            {
                Vector3 spawnPosition = transform.position;
              
        
                //gameObject.GetComponent<PhotonView>().TransferOwnership(player.GetComponent<PhotonView>().Owner);
               // Debug.Log(gameObject.GetComponent<PhotonView>().Owner);
                /*if (gameObject.GetComponent<PhotonView>().Owner == player.GetComponent<PhotonView>().Owner)
                {
                    PhotonNetwork.Destroy(transform.gameObject);
                    PhotonNetwork.Instantiate("PhotonPrefabs/fence_simple_broken_open Variant 1", spawnPosition, Quaternion.Euler(0f, 90f, 0f));
                    isBroken = true;
                    break;

                }*/
                photonView.RPC("DestroyFence", RpcTarget.MasterClient);
                PhotonNetwork.Instantiate("PhotonPrefabs/fence_simple_broken_open Variant 1", spawnPosition, Quaternion.Euler(0f, 90f, 0f));
                isBroken = true;
                break;
                //NetworkServer.Spawn(brokenFence);
            }
        }

        //if (Input.GetKeyDown(KeyCode.P))
        //{
        //    float dist = Vector3.Distance(NetworkClient.connection.identity.transform.position, transform.position);
        //    if (dist <= 2.5f)
        //    {
        //        Vector3 spawnPosition = transform.position;
        //        PhotonNetwork.Destroy(transform.gameObject);
        //        PhotonNetwork.Instantiate("PhotonPrefabs/fence_simple_broken_open Variant 1", spawnPosition, Quaternion.Euler(0f, 90f, 0f));
        //        //NetworkServer.Spawn(brokenFence);
        //    }
        //}
    }
}
