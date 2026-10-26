package com.cms.repository;

import com.cms.entity.Complaint;
import com.cms.entity.ComplaintStatus;
import com.cms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Page<Complaint> findByComplainant(User complainant, Pageable pageable);

    Page<Complaint> findByAssignedEmployee(User assignedEmployee, Pageable pageable);

    long countByStatus(ComplaintStatus status);

    long countByAssignedEmployeeIsNull();

    long countByComplainant(User complainant);

    long countByComplainantAndStatus(User complainant, ComplaintStatus status);

    long countByAssignedEmployee(User assignedEmployee);

    long countByAssignedEmployeeAndStatus(User assignedEmployee, ComplaintStatus status);

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:complainant IS NULL OR c.complainant = :complainant) AND " +
           "(:assignedEmployee IS NULL OR c.assignedEmployee = :assignedEmployee) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:category IS NULL OR LOWER(c.category) = LOWER(:category)) AND " +
           "(:startDate IS NULL OR c.submittedAt >= :startDate) AND " +
           "(:endDate IS NULL OR c.submittedAt <= :endDate) AND " +
           "(:search IS NULL OR " +
           " LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.complainant.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " (c.assignedEmployee IS NOT NULL AND LOWER(c.assignedEmployee.name) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Complaint> searchComplaints(
            @Param("complainant") User complainant,
            @Param("assignedEmployee") User assignedEmployee,
            @Param("status") ComplaintStatus status,
            @Param("category") String category,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countComplaintsByCategory();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countComplaintsByStatusGroup();

    @Query("SELECT c FROM Complaint c WHERE c.status = 'RESOLVED' OR c.status = 'CLOSED'")
    List<Complaint> findResolvedComplaints();

    @Query("SELECT c FROM Complaint c WHERE (c.status = 'RESOLVED' OR c.status = 'CLOSED') AND " +
           "(:startDate IS NULL OR c.resolvedAt >= :startDate) AND " +
           "(:endDate IS NULL OR c.resolvedAt <= :endDate)")
    List<Complaint> findResolvedComplaintsBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT c.assignedEmployee.id, c.assignedEmployee.name, COUNT(c) FROM Complaint c " +
           "WHERE (c.status = 'RESOLVED' OR c.status = 'CLOSED') AND c.assignedEmployee IS NOT NULL AND " +
           "(:startDate IS NULL OR c.resolvedAt >= :startDate) AND " +
           "(:endDate IS NULL OR c.resolvedAt <= :endDate) " +
           "GROUP BY c.assignedEmployee.id, c.assignedEmployee.name")
    List<Object[]> countResolvedByEmployee(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
