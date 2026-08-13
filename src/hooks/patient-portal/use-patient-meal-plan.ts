import type { PatientMealPlan } from 'src/types/domain/patient-portal';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import {
  normalizeDayOfWeek,
  patientPortalService,
} from 'src/services/patientPortal/patientPortalService';

const todayInputValue = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

export const isValidMealPlanDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T12:00:00`).getTime());
};

const matchesDate = (plan: PatientMealPlan, selectedDate: string) => {
  if (!isValidMealPlanDate(selectedDate)) return false;
  const day = new Date(`${selectedDate}T12:00:00`).getDay();
  return plan.daysOfWeek.some((value) => normalizeDayOfWeek(value) === day);
};

export function usePatientMealPlan() {
  const [selectedDate, setSelectedDate] = useState(todayInputValue);
  const [plans, setPlans] = useState<PatientMealPlan[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [detail, setDetail] = useState<PatientMealPlan | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [detailRequestVersion, setDetailRequestVersion] = useState(0);
  const latestRequest = useRef(0);

  const selectedPlan = useMemo(
    () => plans.find((plan) => matchesDate(plan, selectedDate)) ?? null,
    [plans, selectedDate]
  );

  const loadPlans = useCallback(async () => {
    setListLoading(true);
    setListError(false);
    try {
      setPlans(await patientPortalService.getMealPlans());
    } catch {
      setPlans([]);
      setListError(true);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    const request = latestRequest.current + 1;
    latestRequest.current = request;
    setDetailError(false);
    if (!selectedPlan) {
      setDetail(null);
      setDetailLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setDetail(null);
    setDetailLoading(true);
    void patientPortalService
      .getMealPlan(selectedPlan.id, controller.signal)
      .then((result) => {
        if (controller.signal.aborted || request !== latestRequest.current) return;
        setDetail(result);
      })
      .catch(() => {
        if (!controller.signal.aborted && request === latestRequest.current) setDetailError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted && request === latestRequest.current)
          setDetailLoading(false);
      });

    return () => controller.abort();
  }, [detailRequestVersion, selectedDate, selectedPlan]);

  const retryDetail = useCallback(() => {
    if (!selectedPlan) return;
    setDetailRequestVersion((version) => version + 1);
  }, [selectedPlan]);

  return {
    plans,
    detail,
    selectedDate,
    selectedPlan,
    validSelectedDate: isValidMealPlanDate(selectedDate),
    listLoading,
    listError,
    detailLoading,
    detailError,
    setSelectedDate,
    retryList: loadPlans,
    retryDetail,
  };
}
