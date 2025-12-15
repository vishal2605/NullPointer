//USER_CODE_HERE
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int nums1Size = sc.nextInt();
        List<Integer> nums1 = new ArrayList<>();
        for (int i = 0; i < nums1Size; i++) nums1.add(sc.nextInt());
        int nums2Size = sc.nextInt();
        List<Integer> nums2 = new ArrayList<>();
        for (int i = 0; i < nums2Size; i++) nums2.add(sc.nextInt());
        Solution sol = new Solution();
        float result = sol.findMedianSortedArrays(nums1, nums2);
        System.out.println(result);
    }
}