﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class RotateLightAlarm : MonoBehaviour
{
    [SerializeField]
    private GameObject spotlight;
    private bool positiveRotation;

    [SerializeField]
    private float rotationMultiplier;
    public float rotationUpperLimit;
    public float rotationLowerLimit;

    [SerializeField]
    private GameObject pointLight;
    [SerializeField]
    private GameObject spotLight;

    public bool isSpinning;
    // Start is called before the first frame update
    void Start()
    {
        positiveRotation = true;
        isSpinning = false;

        GameObject[] lights = GameObject.FindGameObjectsWithTag("SpinningLight");

        foreach (var light in lights)
        {
            light.GetComponent<rotateLight>().PlayerInLight += SetToSpinning;
        }

    }

    // Update is called once per frame
    void Update()
    {

        if (isSpinning)
        {
            Rotate();
        }
    }

    void Rotate()
    {
        if (positiveRotation == true)
        {
            spotlight.transform.Rotate(Vector3.up * rotationMultiplier * Time.deltaTime);
            if (spotlight.transform.eulerAngles.y > rotationUpperLimit)
            {

                positiveRotation = false;
            }
        }
        else
        {
            spotlight.transform.Rotate(Vector3.up * -rotationMultiplier * Time.deltaTime);
            if (spotlight.transform.eulerAngles.y < rotationLowerLimit)
            {
                positiveRotation = true;
            }
        }
    }

    void SetToSpinning()
    {
        isSpinning = true;
        pointLight.SetActive(true);
        spotLight.SetActive(true);
    }
}
