import { useContext, useEffect, useState } from "react";
import axios from "axios"
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from '@stripe/react-stripe-js';
import { useParams } from "react-router"
import { API } from "../api"
import { AuthContext } from "../contexts/AuthContext"
import { CheckoutForm } from './CheckoutForm'

const stripePromise = loadStripe('');


export function Payment() {
    const [clientSecret, setClientSecret] = useState("");
    const [canSponsor, setCanSponsor] = useState(false)
    const { user: { token } } = useContext(AuthContext)
    const { id } = useParams()

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        async function createPayment() {
            try {
                const res = await axios.post(
                    API.payment.createPayment, 
                    {job_id: id}, 
                    {headers: {"Authorization": `Token ${token}`}
                })
                setClientSecret(res.data.clientSecret)
            } catch (e) {
                console.log(e)
            }
        }

        async function fetchSponsoredJobCount() {
            try {
                const res = await axios.get(
                    API.jobs.sponsoredJobCount,
                    {headers: {"Authorization": `Token ${token}`}
                })
                setCanSponsor(res.data.job_count < 3)
            } catch (e) {
                console.log(e)
            }
        }

        createPayment()
        fetchSponsoredJobCount()

    }, [token, id]);

    const appearance = {
        theme: 'stripe',
    };
    const options = {
        clientSecret,
        appearance,
    };
    
    return (
        <div>
            {!canSponsor && (
                <div className="text-gray-600">
                    <p>We already have 3 sponsored posts. Please check back in a few days for an open slot.</p>
                </div>
            )}
            {clientSecret && canSponsor && (
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm />
                </Elements>
            )}
        </div>
    )
}